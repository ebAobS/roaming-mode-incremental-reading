/*
 * Copyright (c) 2025, ebAobS . All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  ebAobS designates this
 * particular file as subject to the "Classpath" exception as provided
 * by ebAobS in the LICENSE file that accompanied this code.
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
 * Please contact ebAobS, ebAobs@outlook.com
 * or visit https://github.com/ebAobS/roaming-mode-incremental-reading if you need additional information or have any
 * questions.
 */

/**
 * ========================================
 * 漫游式渐进阅读插件 - 配置模型
 * ========================================
 *
 * 本文件定义了插件的主要配置模型，包括漫游模式、过滤器和其他运行时配置。
 * 这些配置被存储在思源笔记的数据存储中，用于控制插件的主要行为。
 *
 * ## 文件结构
 * 1. 枚举定义 - 定义配置中使用的枚举类型
 * 2. 配置类 - 定义插件的主要配置模型
 */

/**
 * 1. 枚举定义
 */

/**
 * 1.1 复习模式枚举
 * 定义文档复习的两种主要模式
 */
export enum ReviewMode {
  /** 1.2.0 渐进式复习模式，基于优先级系统 */
  Incremental = "incremental"
}

/**
 * 1.2 过滤模式枚举
 * 定义文档筛选的两种主要方式
 */
export enum FilterMode {
  /** 1.2.1 按笔记本过滤 */
  Notebook = "notebook",
  /** 1.2.2 按根文档过滤 */
  Root = "root",
  /** 1.2.3 按标签过滤 */
  Tag = "tag",
  /** 1.2.4 按SQL过滤 */
  SQL = "sql",
}

/**
 * 2. 配置类
 * 定义插件的主要配置模型
 */
class RandomDocConfig {
  /**
   * 2.1 笔记本ID
   * 当过滤模式为Notebook时使用的笔记本ID
   */
  public notebookId: string

  /**
   * 2.3 SQL筛选查询语句
   * 当过滤模式为SQL时使用的自定义SQL查询语句
   */
  public sqlQuery: string = ""

  /**
   * 2.6 复习模式
   * 控制文档的复习方式，默认为渐进式
   */
  reviewMode: ReviewMode = ReviewMode.Incremental

  /**
   * 2.7 过滤模式
   * 控制文档的筛选方式，默认为按笔记本
   */
  filterMode: FilterMode = FilterMode.Notebook

  /**
   * 2.8 根文档ID
   * 当过滤模式为Root时使用的根文档ID
   */
  rootId = ""

  /**
   * 2.8.1 根文档标题
   * 存储根文档的标题，用于显示
   */
  rootDocTitle = ""

  /**
   * 2.9 标签列表
   * 当过滤模式为Tag时使用的标签数组，支持多个
   */
  tags: string[] = []

  /**
   * 2.9 渐进模式配置ID
   * 用于存储渐进模式的配置数据
   */
  incrementalConfigId = "incremental_config"

  /**
   * 2.10 是否排除今日已访问文档
   * 控制是否在漫游时排除今天已经访问过的文档
   */
  excludeVisited = true

  /** 推荐 - 最近漫游基准文档数 */
  public recentAnchorCount: number = 3
  /** 推荐 - 漫游次数最多的基准文档数 */
  public topAnchorCount: number = 2
  /** 推荐 - 返回条数 */
  public recommendTopK: number = 8
  /** 推荐 - 最大候选数 */
  public recommendMaxCandidates: number = 120
  /** 推荐 - 采样段落数上限 */
  public recommendMaxParagraphs: number = 8

  /**
   * 2.12 是否在启动时自动重置已访问文档记录
   * 控制是否在每次启动时自动清空已访问文档记录
   */
  public autoResetOnStartup = false

  /**
   * 2.13 调试日志开关
   * 控制是否输出调试日志，默认关闭以避免性能影响
   */
  public enableDebugLog = false

  /**
   * 2.14 自动重载功能开关
   * 当没有可漫游的文档时，自动清除访问记录并重新开始
   * 默认关闭
   */
  public autoReloadWhenEmpty = false

  /**
   * 2.13 构造函数
   * 初始化配置对象，设置默认值
   */
  constructor() {
    this.filterMode = this.filterMode || FilterMode.Notebook
    this.rootId = this.rootId || ""
    this.excludeVisited = this.excludeVisited !== false
    this.autoResetOnStartup = this.autoResetOnStartup ?? false
    this.absolutePriorityProb = this.absolutePriorityProb ?? 0
    this.enableDebugLog = this.enableDebugLog ?? false
    this.autoReloadWhenEmpty = this.autoReloadWhenEmpty ?? false
    this.recentAnchorCount = this.recentAnchorCount ?? 3
    this.topAnchorCount = this.topAnchorCount ?? 2
    this.recommendTopK = this.recommendTopK ?? 8
    this.recommendMaxCandidates = this.recommendMaxCandidates ?? 120
    this.recommendMaxParagraphs = this.recommendMaxParagraphs ?? 8
  }

  /**
   * 2.14 绝对优先级顺序漫游概率（0~1，0为禁用，1为100%）
   * 用户可设置，表示每次漫游有多少概率直接选择优先级最高的未访问文档
   */
  public absolutePriorityProb: number = 0;
}

export default RandomDocConfig
