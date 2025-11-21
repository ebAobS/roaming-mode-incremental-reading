import RandomDocPlugin from "../index"
import IncrementalReviewer from "./IncrementalReviewer"
import { sampleMarkdown, tokenize } from "../utils/textUtil"
import { RecommendationConfig, getDefaultRecommendationConfig } from "../models/RecommendationConfig"

export interface RecommendationItem {
  id: string
  title: string
  score: number
  anchors: string[]
}

interface RecommendationOptions {
  reviewer: IncrementalReviewer
  config: RecommendationConfig
}

/**
 * ======================================================
 * 智能推荐服务 - 多锚点内容相似度
 * ======================================================
 *
 * 设计要点：
 * 1) 多基准文档（anchors）：最近漫游 N 篇 + 漫游次数最多 M 篇，减少单文档偏差。
 * 2) 复用筛选条件：依赖 IncrementalReviewer 的过滤条件，保证与漫游视图一致。
 * 3) 文本采样：标题 + 头段 + 中段 + 尾段，控制最长段落数，避免长文稀释和内存暴涨。
 * 4) 轻量 TF-IDF：自行构建稀疏向量，TF 归一化后乘 IDF，余弦求相似度。
 * 5) 性能保险：候选数量、采样段落数可配置；SQL 自动加表别名，避免列名歧义。
 */
class RecommendationService {
  private plugin: RandomDocPlugin

  constructor(plugin: RandomDocPlugin) {
    this.plugin = plugin
  }

  /**
   * 主入口：获取推荐列表
   * 流程：过滤条件 -> 锚点 -> 候选 -> 采样+分词 -> TF-IDF -> 多锚点余弦 -> Top K
   */
  public async getRecommendations(opts: RecommendationOptions): Promise<RecommendationItem[]> {
    const { reviewer, config } = opts
    const filterCondition = await reviewer.buildFilterCondition()

    // 1) 获取锚点文档（多源去重）
    const anchors = await this.pickAnchors(filterCondition, config)
    if (anchors.length === 0) {
      return []
    }

    // 2) 获取候选文档（排除锚点，受上限约束）
    const candidates = await this.pickCandidates(filterCondition, config, anchors.map((a) => a.id))
    if (candidates.length === 0) {
      return []
    }

    // 3) 构造 TF-IDF 向量（包含 anchors 与 candidates）
    const allDocs = anchors.concat(candidates)
    const tokenized = await this.buildDocTokens(allDocs, config)
    const vectors = this.buildTfidfVectors(tokenized)

    // 4) 多锚点相似度计算
    const anchorIds = anchors.map((a) => a.id)
    const anchorVectors = anchorIds
      .map((id) => vectors.get(id))
      .filter((v): v is Map<string, number> => !!v && v.size > 0)

    if (anchorVectors.length === 0) {
      return []
    }

    // 5) 逐候选求均值相似度，并排序取 Top K
    const results: RecommendationItem[] = []
    for (const candidate of candidates) {
      const vec = vectors.get(candidate.id)
      if (!vec || vec.size === 0) continue
      const score = this.combineSimilarities(anchorVectors, vec)
      if (score <= 0) continue
      results.push({
        id: candidate.id,
        title: candidate.title,
        score,
        anchors: anchorIds
      })
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, config.topK)
  }

  /**
   * 选取锚点文档
   * - 最近漫游 N 篇：按 custom-roaming-last 倒序
   * - 漫游次数最多 M 篇：按 custom-roaming-count 倒序
   * - 结果去重后返回
   */
  private async pickAnchors(filterCondition: string, config: RecommendationConfig) {
    const aliased = this.applyAlias(filterCondition, "b")
    const recentSql = `
      SELECT b.id, b.content, attr.value AS lastTime
      FROM blocks b
      JOIN attributes attr ON attr.block_id = b.id AND attr.name = 'custom-roaming-last' AND attr.value <> ''
      WHERE b.type = 'd'
      ${aliased}
      ORDER BY attr.value DESC
      LIMIT ${config.recentAnchorCount}
    `

    const topSql = `
      SELECT b.id, b.content, attr.value AS cnt
      FROM blocks b
      JOIN attributes attr ON attr.block_id = b.id AND attr.name = 'custom-roaming-count' AND attr.value <> ''
      WHERE b.type = 'd'
      ${aliased}
      ORDER BY CAST(attr.value AS INTEGER) DESC
      LIMIT ${config.topAnchorCount}
    `

    const recents = await this.safeFetchDocs(recentSql)
    const tops = await this.safeFetchDocs(topSql)

    const merged = new Map<string, { id: string; title: string }>()
    recents.concat(tops).forEach((item) => {
      merged.set(item.id, item)
    })

    return Array.from(merged.values())
  }

  /**
   * 拉取候选文档：沿用过滤条件，排除 anchors，自设候选上限
   */
  private async pickCandidates(filterCondition: string, config: RecommendationConfig, excludeIds: string[]) {
    const excludeClause =
      excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.map((id) => `'${id}'`).join(",")})` : ""
    const sql = `
      SELECT id, content
      FROM blocks
      WHERE type = 'd'
      ${filterCondition}
      ${excludeClause}
      ORDER BY updated DESC
      LIMIT ${config.maxCandidates}
    `
    return await this.safeFetchDocs(sql)
  }

  /**
   * 获取文档并保证 title 字段可用（content 为空时兜底为“未命名文档”）
   */
  private async safeFetchDocs(sql: string): Promise<Array<{ id: string; title: string }>> {
    const result = await this.plugin.kernelApi.sql(sql)
    if (result.code !== 0) {
      this.plugin.logger.error("获取推荐文档列表失败", { sql, msg: result.msg })
      return []
    }
    const rows = (result.data as any[]) || []
    return rows.map((row) => ({
      id: row.id,
      title: (row.content || "").trim() || "未命名文档"
    }))
  }

  /**
   * 为 anchors 与 candidates 采样文本、分词
   * - sampleMarkdown 控制长文采样（标题 + 头/中/尾）
   * - tokenize 轻量分词（中文逐字、英文单词），移除停用词
   * - 空文档退化为标题分词
   */
  private async buildDocTokens(
    docs: Array<{ id: string; title: string }>,
    config: RecommendationConfig
  ): Promise<Map<string, string[]>> {
    const cache = new Map<string, string[]>()
    for (const doc of docs) {
      try {
        const markdown = await this.plugin.kernelApi.getDocMarkdown(doc.id)
        const sampled = sampleMarkdown(markdown, doc.title, config.maxParagraphs)
        cache.set(doc.id, tokenize(sampled))
      } catch (error) {
        this.plugin.logger.error("采样文档失败", { id: doc.id, error })
        cache.set(doc.id, tokenize(doc.title || ""))
      }
    }
    return cache
  }

  /**
   * 构建 TF-IDF 稀疏向量：TF 归一化后乘 IDF
   */
  private buildTfidfVectors(tokenMap: Map<string, string[]>): Map<string, Map<string, number>> {
    // 1) 统计 DF
    const df = new Map<string, number>()
    tokenMap.forEach((tokens) => {
      const unique = new Set(tokens)
      unique.forEach((t) => df.set(t, (df.get(t) || 0) + 1))
    })

    const totalDocs = tokenMap.size || 1
    const vectors = new Map<string, Map<string, number>>()

    // 2) 逐文档计算 TF-IDF（TF 先做长度归一化，避免长文稀释短文权重）
    tokenMap.forEach((tokens, docId) => {
      const tf = new Map<string, number>()
      const len = tokens.length || 1
      tokens.forEach((t) => {
        tf.set(t, (tf.get(t) || 0) + 1)
      })

      const vec = new Map<string, number>()
      tf.forEach((count, term) => {
        const termDf = df.get(term) || 1
        const idf = Math.log((1 + totalDocs) / (1 + termDf)) + 1
        const weight = (count / len) * idf
        vec.set(term, weight)
      })

      vectors.set(docId, vec)
    })

    return vectors
  }

  /**
   * 多锚点相似度：对每个锚点求余弦，相似度取平均
   */
  private combineSimilarities(anchors: Map<string, number>[], candidate: Map<string, number>): number {
    if (anchors.length === 0) return 0
    const scores = anchors.map((anchorVec) => this.cosine(anchorVec, candidate)).filter((s) => s > 0)
    if (scores.length === 0) return 0
    const sum = scores.reduce((a, b) => a + b, 0)
    return sum / scores.length
  }

  /**
   * 余弦相似度（稀疏 Map 版）
   */
  private cosine(a: Map<string, number>, b: Map<string, number>): number {
    let dot = 0
    let normA = 0
    let normB = 0

    a.forEach((val, key) => {
      normA += val * val
      if (b.has(key)) {
        dot += val * (b.get(key) as number)
      }
    })

    b.forEach((val) => {
      normB += val * val
    })

    if (dot === 0 || normA === 0 || normB === 0) return 0
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * 给过滤条件添加表别名前缀，避免与 JOIN 时的歧义（如 box、id、path）
   * 仅在遇到裸字段名时补充；已有前缀的不处理。
   */
  private applyAlias(condition: string, alias: string): string {
    if (!condition || !alias) return condition
    return condition.replace(/\b(box|id|path)\b/g, (match, _p1, offset, full) => {
      const before = full[offset - 1]
      if (before === ".") return match
      return `${alias}.${match}`
    })
  }
}

export const buildRecommendationConfig = (
  store: any | undefined
): RecommendationConfig => {
  const defaults = getDefaultRecommendationConfig()
  return {
    recentAnchorCount: store?.recentAnchorCount ?? defaults.recentAnchorCount,
    topAnchorCount: store?.topAnchorCount ?? defaults.topAnchorCount,
    topK: store?.recommendTopK ?? defaults.topK,
    maxCandidates: store?.recommendMaxCandidates ?? defaults.maxCandidates,
    maxParagraphs: store?.recommendMaxParagraphs ?? defaults.maxParagraphs
  }
}

export default RecommendationService
