import type RandomDocPlugin from "../index"

export const WORKSPACE_WORD_COUNT_HISTORY_KEY = "workspace-word-count-history.json"

const DAY_IN_SECONDS = 24 * 60 * 60
const HISTORY_DAYS = 30

export interface DailyWordCountPeak {
  date: string
  wordCount: number
}

export interface WorkspaceWordCountSnapshot {
  now: number
  sevenDayPeak: number
  thirtyDayPeak: number
}

export const toLocalDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const toUtcDayNumber = (dateKey: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const timestamp = Date.UTC(year, month - 1, day)
  const parsed = new Date(timestamp)
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null
  }
  return timestamp / 1000 / DAY_IN_SECONDS
}

const normalizeWordCount = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null
  }
  return Math.floor(value)
}

export const normalizeDailyPeaks = (value: unknown, referenceDate: Date): DailyWordCountPeak[] => {
  if (!Array.isArray(value)) return []

  const today = toUtcDayNumber(toLocalDateKey(referenceDate))
  if (today === null) return []

  const oldest = today - HISTORY_DAYS + 1
  const peakByDate = new Map<string, number>()
  for (const item of value) {
    if (!item || typeof item !== "object") continue

    const date = (item as any).date
    const dayNumber = typeof date === "string" ? toUtcDayNumber(date) : null
    const wordCount = normalizeWordCount((item as any).wordCount)
    if (dayNumber === null || dayNumber < oldest || dayNumber > today || wordCount === null) {
      continue
    }

    peakByDate.set(date, Math.max(peakByDate.get(date) ?? 0, wordCount))
  }

  return Array.from(peakByDate, ([date, wordCount]) => ({ date, wordCount })).sort((a, b) =>
    a.date.localeCompare(b.date)
  )
}

export const upsertDailyPeak = (
  history: unknown,
  currentWordCount: number,
  referenceDate: Date
): DailyWordCountPeak[] => {
  const normalizedCurrent = normalizeWordCount(currentWordCount)
  if (normalizedCurrent === null) {
    throw new Error("总字数必须是有限非负数")
  }

  const result = normalizeDailyPeaks(history, referenceDate)
  const today = toLocalDateKey(referenceDate)
  const todayPeak = result.find((item) => item.date === today)
  if (todayPeak) {
    todayPeak.wordCount = Math.max(todayPeak.wordCount, normalizedCurrent)
  } else {
    result.push({ date: today, wordCount: normalizedCurrent })
    result.sort((a, b) => a.date.localeCompare(b.date))
  }
  return result
}

export const getRecentPeak = (
  history: unknown,
  days: number,
  referenceDate: Date
): number | null => {
  if (!Number.isInteger(days) || days <= 0) return null

  const today = toUtcDayNumber(toLocalDateKey(referenceDate))
  if (today === null) return null

  const oldest = today - days + 1
  const peaks = normalizeDailyPeaks(history, referenceDate)
    .filter((item) => {
      const dayNumber = toUtcDayNumber(item.date)
      return dayNumber !== null && dayNumber >= oldest && dayNumber <= today
    })
    .map((item) => item.wordCount)

  return peaks.length > 0 ? Math.max(...peaks) : null
}

export default class WorkspaceWordCountService {
  private pluginInstance: RandomDocPlugin
  private history: DailyWordCountPeak[] = []
  private historyLoaded = false
  private canPersist = true
  private persistedHistory = "[]"

  constructor(pluginInstance: RandomDocPlugin) {
    this.pluginInstance = pluginInstance
  }

  public async getSnapshot(referenceDate?: Date): Promise<WorkspaceWordCountSnapshot> {
    const currentWordCount = await this.pluginInstance.kernelApi.getWorkspaceWordCount()
    const date = referenceDate ?? new Date()
    await this.ensureHistoryLoaded(date)

    const nextHistory = upsertDailyPeak(this.history, currentWordCount, date)
    this.history = nextHistory
    await this.persistIfNeeded(nextHistory)

    return {
      now: currentWordCount,
      sevenDayPeak: getRecentPeak(nextHistory, 7, date) ?? currentWordCount,
      thirtyDayPeak: getRecentPeak(nextHistory, HISTORY_DAYS, date) ?? currentWordCount,
    }
  }

  private async ensureHistoryLoaded(referenceDate: Date) {
    if (this.historyLoaded) return

    this.historyLoaded = true
    try {
      const saved = await this.pluginInstance.loadData(WORKSPACE_WORD_COUNT_HISTORY_KEY)
      this.history = normalizeDailyPeaks(saved, referenceDate)
      this.persistedHistory = JSON.stringify(Array.isArray(saved) ? saved : [])
    } catch (error) {
      this.canPersist = false
      this.pluginInstance.logger.error("加载工作空间字数历史失败", error)
    }
  }

  private async persistIfNeeded(history: DailyWordCountPeak[]) {
    if (!this.canPersist) return

    const serialized = JSON.stringify(history)
    if (serialized === this.persistedHistory) return

    try {
      await this.pluginInstance.saveData(WORKSPACE_WORD_COUNT_HISTORY_KEY, history)
      this.persistedHistory = serialized
    } catch (error) {
      this.pluginInstance.logger.error("保存工作空间字数历史失败", error)
    }
  }
}
