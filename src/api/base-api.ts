/*
 * Copyright (c) 2023, Terwer . All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Terwer designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Terwer in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Terwer, Shenzhen, Guangdong, China, youweics@163.com
 * or visit www.terwer.space if you need additional information or have any
 * questions.
 */

import { isDev, siyuanApiToken, siyuanApiUrl } from "../Constants"
import { simpleLogger } from "zhi-lib-base"

/**
 * 思源 API 返回类型
 */
export interface SiyuanData {
  /**
   * 非 0 为异常情况
   */
  code: number

  /**
   * 正常情况下是空字符串，异常情况下会返回错误文案
   */
  msg: string

  /**
   * 可能为 \{\}、[] 或者 NULL，根据不同接口而不同
   */
  data: any[] | object | null | undefined
}

export class BaseApi {
  protected logger
  protected baseLogger
  protected debugLogEnabled = false

  constructor() {
    this.baseLogger = simpleLogger("base-api", "random-doc", isDev)
    this.logger = this.createLoggerProxy()
  }

  public setDebugLogEnabled(enabled: boolean) {
    this.debugLogEnabled = !!enabled
  }

  /**
   * 以sql发送请求
   * @param sql sql
   */
  public async sql(sql: string): Promise<SiyuanData> {
    const sqldata = {
      stmt: sql,
    }
    const url = "/api/query/sql"
    return await this.siyuanRequest(url, sqldata)
  }

  /**
   * 向思源请求数据
   *
   * @param url - url
   * @param data - 数据
   */
  public async siyuanRequest(url: string, data: object): Promise<SiyuanData> {
    const reqUrl = `${siyuanApiUrl}${url}`

    const fetchOps = {
      body: JSON.stringify(data),
      method: "POST",
    }
    if (siyuanApiToken !== "") {
      Object.assign(fetchOps, {
        headers: {
          Authorization: `Token ${siyuanApiToken}`,
        },
      })
    }

    if (this.debugLogEnabled) {
      this.logger.debug("开始向思源请求数据，reqUrl=>", reqUrl)
      this.logger.debug("开始向思源请求数据，fetchOps=>", fetchOps)
    }

    const response = await fetch(reqUrl, fetchOps)
    const resJson = (await response.json()) as SiyuanData
    if (this.debugLogEnabled) {
      this.logger.debug("思源请求数据返回，resJson=>", resJson)
    }
    return resJson
  }

  /**
   * 批量向思源请求数据
   * 将多个请求合并为一个批次，减少网络开销
   *
   * @param requests - 请求列表，每个请求包含url和data
   * @returns 批量请求结果，结果顺序与请求顺序一致
   */
  public async batchSiyuanRequest(requests: Array<{url: string, data: object}>): Promise<SiyuanData[]> {
    if (!requests || requests.length === 0) {
      return []
    }

    // 如果只有一个请求，直接调用单个请求方法
    if (requests.length === 1) {
      const result = await this.siyuanRequest(requests[0].url, requests[0].data)
      return [result]
    }

    if (this.debugLogEnabled) {
      this.logger.debug(`开始批量请求，共 ${requests.length} 个请求`)
    }

    // 并行执行所有请求
    const promises = requests.map(request => this.siyuanRequest(request.url, request.data))
    const results = await Promise.all(promises)

    if (this.debugLogEnabled) {
      this.logger.debug(`批量请求完成，返回 ${results.length} 个结果`)
    }

    return results
  }

  private createLoggerProxy() {
    return {
      info: (...args: any[]) => {
        if (this.debugLogEnabled) {
          this.baseLogger.info(...args)
        }
      },
      warn: (...args: any[]) => {
        if (this.debugLogEnabled) {
          this.baseLogger.warn(...args)
        }
      },
      error: (...args: any[]) => {
        if (this.debugLogEnabled) {
          this.baseLogger.error(...args)
        }
      },
      debug: (...args: any[]) => {
        if (this.debugLogEnabled) {
          this.baseLogger.debug(...args)
        }
      }
    }
  }
}
