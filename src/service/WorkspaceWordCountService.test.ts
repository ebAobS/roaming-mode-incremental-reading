import { describe, expect, it } from "vitest"
import WorkspaceWordCountService, {
  getRecentPeak,
  normalizeDailyPeaks,
  toLocalDateKey,
  upsertDailyPeak,
  WORKSPACE_WORD_COUNT_HISTORY_KEY,
} from "./WorkspaceWordCountService"

const localDate = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12)

const createPlugin = (currentWordCount: number, savedHistory: unknown) => {
  const writes: Array<{ key: string; value: unknown }> = []
  const plugin = {
    kernelApi: {
      getWorkspaceWordCount: async () => currentWordCount,
    },
    loadData: async () => savedHistory,
    saveData: async (key: string, value: unknown) => {
      writes.push({ key, value })
    },
    logger: {
      error: () => {},
    },
  }
  return { plugin, writes }
}

describe("工作空间字数每日峰值", () => {
  it("同一天只保留最高值，当前值可以独立下降", async () => {
    const today = localDate(2026, 2, 8)
    const dateKey = toLocalDateKey(today)
    const saved = [{ date: dateKey, wordCount: 1000 }]
    const { plugin, writes } = createPlugin(700, saved)

    const snapshot = await new WorkspaceWordCountService(plugin as any).getSnapshot(today)

    expect(snapshot).toEqual({ now: 700, sevenDayPeak: 1000, thirtyDayPeak: 1000 })
    expect(writes).toHaveLength(0)

    const raised = upsertDailyPeak(saved, 1200, today)
    expect(raised).toEqual([{ date: dateKey, wordCount: 1200 }])
  })

  it("按自然日计算近 7 天和近 30 天，并清理第 31 天", () => {
    const referenceDate = localDate(2026, 3, 31)
    const history = [
      { date: "2026-03-25", wordCount: 700 },
      { date: "2026-03-24", wordCount: 800 },
      { date: "2026-03-02", wordCount: 300 },
      { date: "2026-03-01", wordCount: 1000 },
      { date: "2026-03-30", wordCount: 500 },
    ]

    const updated = upsertDailyPeak(history, 100, referenceDate)

    expect(getRecentPeak(updated, 7, referenceDate)).toBe(700)
    expect(getRecentPeak(updated, 30, referenceDate)).toBe(800)
    expect(updated.some((item) => item.date === "2026-03-01")).toBe(false)
    expect(updated.some((item) => item.date === "2026-03-31")).toBe(true)
  })

  it("忽略损坏、重复、未来及无效日期记录", () => {
    const referenceDate = localDate(2026, 6, 15)
    const normalized = normalizeDailyPeaks(
      [
        { date: "2026-06-10", wordCount: 200 },
        { date: "2026-06-10", wordCount: 400 },
        { date: "2026-06-16", wordCount: 900 },
        { date: "2026-02-30", wordCount: 900 },
        { date: "2026-06-11", wordCount: -1 },
        { date: "2026-06-11", wordCount: "800" },
        { date: "invalid", wordCount: 800 },
        null,
      ],
      referenceDate
    )

    expect(normalized).toEqual([{ date: "2026-06-10", wordCount: 400 }])
    expect(getRecentPeak([], 7, referenceDate)).toBeNull()
  })

  it("首次有效统计会初始化并持久化两个峰值", async () => {
    const today = localDate(2026, 1, 1)
    const { plugin, writes } = createPlugin(1234, null)

    const snapshot = await new WorkspaceWordCountService(plugin as any).getSnapshot(today)

    expect(snapshot).toEqual({ now: 1234, sevenDayPeak: 1234, thirtyDayPeak: 1234 })
    expect(writes).toEqual([
      {
        key: WORKSPACE_WORD_COUNT_HISTORY_KEY,
        value: [{ date: "2026-01-01", wordCount: 1234 }],
      },
    ])
  })
})
