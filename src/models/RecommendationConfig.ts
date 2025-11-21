/*
 * Recommendation config for multi-anchor suggestions.
 */

export interface RecommendationConfig {
  /** 最近漫游的基准文档数量 */
  recentAnchorCount: number
  /** 漫游次数最多的基准文档数量 */
  topAnchorCount: number
  /** 返回的推荐条数 */
  topK: number
  /** 相似度计算的候选上限，防止一次拉取过多文档 */
  maxCandidates: number
  /** 超长文档采样：最多取的段落数（头 + 中间采样 + 尾部） */
  maxParagraphs: number
}

export const getDefaultRecommendationConfig = (): RecommendationConfig => ({
  recentAnchorCount: 3,
  topAnchorCount: 2,
  topK: 8,
  maxCandidates: 120,
  maxParagraphs: 8
})
