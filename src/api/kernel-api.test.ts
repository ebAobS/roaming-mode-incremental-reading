import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

let KernelApi: typeof import("./kernel-api").default

beforeAll(async () => {
  vi.stubGlobal("window", {
    siyuan: {
      config: {
        system: {
          workspaceDir: "",
          dataDir: "",
        },
      },
    },
  })
  KernelApi = (await import("./kernel-api")).default
})

afterAll(() => {
  vi.unstubAllGlobals()
})

const createKernelApi = (docCount: number, legacyResponse = false) => {
  const api = Object.create(KernelApi.prototype) as InstanceType<typeof KernelApi>
  const allIds = Array.from({ length: docCount }, (_, index) => `doc-${index}`)
  const sqlStatements: string[] = []
  const batchSizes: number[] = []

  api.sql = async (stmt: string) => {
    sqlStatements.push(stmt)
    const match = /LIMIT (\d+) OFFSET (\d+)/.exec(stmt)
    if (!match) throw new Error("查询必须显式分页")

    const limit = Number(match[1])
    const offset = Number(match[2])
    return {
      code: 0,
      msg: "",
      data: allIds.slice(offset, offset + limit).map((id) => ({ id })),
    }
  }
  api.siyuanRequest = async (_url: string, data: object) => {
    const ids = (data as any).ids as string[]
    batchSizes.push(ids.length)
    return {
      code: 0,
      msg: "",
      data: legacyResponse ? { wordCount: ids.length } : { stat: { wordCount: ids.length } },
    }
  }

  return { api, sqlStatements, batchSizes }
}

describe("工作空间总字数 API", () => {
  it("分页读取全部文档并按 200 篇一批统计", async () => {
    const { api, sqlStatements, batchSizes } = createKernelApi(2505)

    await expect(api.getWorkspaceWordCount()).resolves.toBe(2505)
    expect(sqlStatements).toHaveLength(3)
    expect(sqlStatements[0]).toContain("ORDER BY id LIMIT 1000 OFFSET 0")
    expect(sqlStatements[2]).toContain("LIMIT 1000 OFFSET 2000")
    expect(batchSizes).toHaveLength(13)
    expect(batchSizes[batchSizes.length - 1]).toBe(105)
    expect(Math.max(...batchSizes)).toBe(200)
  })

  it("兼容旧版字数接口响应及空工作空间", async () => {
    const legacy = createKernelApi(3, true)
    await expect(legacy.api.getWorkspaceWordCount()).resolves.toBe(3)

    const empty = createKernelApi(0)
    await expect(empty.api.getWorkspaceWordCount()).resolves.toBe(0)
    expect(empty.batchSizes).toHaveLength(0)
  })
})
