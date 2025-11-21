/*
 * Text utilities for lightweight content sampling and tokenization.
 */

const stopwords = new Set<string>([
  // English
  "the","a","an","and","or","of","in","on","at","to","for","from","by","with","is","are","was","were","be","been","being","this","that","these","those","it","its","as","but","if","then","than","so","because","while","about","into","over","after","before","between","them","they","their",
  // Simplified Chinese common function words
  "的","了","在","是","我","有","和","就","不","也","都","一个","上","中","下","与","及","被","对","你","他","她","这","那","着","之","或","而","被","并","等","还"
])

/**
 * 去除 Markdown 语法后，按段落采样：标题 + 头几段 + 中间一段 + 末尾一段。
 */
export const sampleMarkdown = (markdown: string, title = "", maxParagraphs = 8): string => {
  if (!markdown && title) return title
  const cleaned = stripMarkdown(markdown || "")
  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const picks: string[] = []
  if (title) picks.push(title.trim())
  const headCount = Math.min(3, paragraphs.length)
  for (let i = 0; i < headCount; i++) picks.push(paragraphs[i])

  const midIndex = paragraphs.length > 6 ? Math.floor(paragraphs.length / 2) : -1
  if (midIndex >= 0) picks.push(paragraphs[midIndex])

  if (paragraphs.length > 0) picks.push(paragraphs[paragraphs.length - 1])

  const deduped = Array.from(new Set(picks)).filter(Boolean)
  return deduped.slice(0, maxParagraphs).join("\n")
}

/**
 * 简单去除 Markdown 标记、代码块等噪声。
 */
export const stripMarkdown = (text: string): string => {
  return text
    .replace(/```[\\s\\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\\[[^\\]]*\\]\\([^\\)]*\\)/g, " ")
    .replace(/\\[[^\\]]*\\]\\([^\\)]*\\)/g, " ")
    .replace(/^#{1,6}\\s+/gm, " ")
    .replace(/>\\s?/g, " ")
    .replace(/[-*_]{3,}/g, " ")
    .replace(/\\s+/g, " ")
    .trim()
}

/**
 * 粗粒度分词：中文按字符，英文按单词；移除停用词。
 */
export const tokenize = (text: string): string[] => {
  if (!text) return []
  const lower = text.toLowerCase()
  const tokens = lower.match(/[a-z0-9]+|[\\u4e00-\\u9fa5]/g) || []
  return tokens.filter((t) => !stopwords.has(t))
}
