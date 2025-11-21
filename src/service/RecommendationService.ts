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
 * Multi-anchor content-based recommender.
 */
class RecommendationService {
  private plugin: RandomDocPlugin

  constructor(plugin: RandomDocPlugin) {
    this.plugin = plugin
  }

  public async getRecommendations(opts: RecommendationOptions): Promise<RecommendationItem[]> {
    const { reviewer, config } = opts
    const filterCondition = await reviewer.buildFilterCondition()

    const anchors = await this.pickAnchors(filterCondition, config)
    if (anchors.length === 0) {
      return []
    }

    const candidates = await this.pickCandidates(filterCondition, config, anchors.map((a) => a.id))
    if (candidates.length === 0) {
      return []
    }

    const allDocs = anchors.concat(candidates)
    const tokenized = await this.buildDocTokens(allDocs, config)
    const vectors = this.buildTfidfVectors(tokenized)

    const anchorIds = anchors.map((a) => a.id)
    const anchorVectors = anchorIds
      .map((id) => vectors.get(id))
      .filter((v): v is Map<string, number> => !!v && v.size > 0)

    if (anchorVectors.length === 0) {
      return []
    }

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
   * 获取文档并且保证 title 字段可用。
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
   * 为 anchors 和 candidates 采样文本、分词。
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

  private buildTfidfVectors(tokenMap: Map<string, string[]>): Map<string, Map<string, number>> {
    const df = new Map<string, number>()
    tokenMap.forEach((tokens) => {
      const unique = new Set(tokens)
      unique.forEach((t) => df.set(t, (df.get(t) || 0) + 1))
    })

    const totalDocs = tokenMap.size || 1
    const vectors = new Map<string, Map<string, number>>()

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

  private combineSimilarities(anchors: Map<string, number>[], candidate: Map<string, number>): number {
    if (anchors.length === 0) return 0
    const scores = anchors.map((anchorVec) => this.cosine(anchorVec, candidate)).filter((s) => s > 0)
    if (scores.length === 0) return 0
    const sum = scores.reduce((a, b) => a + b, 0)
    return sum / scores.length
  }

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
   * 给过滤条件添加表别名前缀，避免与 JOIN 时的歧义（如 box、id、path）。
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
