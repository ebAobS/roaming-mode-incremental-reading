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
 * 漫游式渐进阅读插件入口文件
 * ========================================
 * 
 * 本文件是漫游式渐进阅读插件的核心入口点，实现了插件的初始化和基础功能。
 * 
 * ## 文件结构
 * 1. 插件类定义 - RandomDocPlugin 类是整个插件的主体
 * 2. 插件生命周期方法 - 包括 onload 方法用于初始化插件
 * 3. 工具方法 - 包括配置加载等辅助功能
 */

import { App, getFrontend, IModel, IObject, Plugin } from "siyuan"
import { simpleLogger } from "zhi-lib-base"

import "../index.styl"
import { isDev } from "./Constants"
import { initTopbar, registerCommand } from "./topbar"
import KernelApi from "./api/kernel-api"
import IncrementalReviewer from "./service/IncrementalReviewer"
import { initFloatingButton } from "./floatingButton"

/**
 * 1. 漫游式渐进阅读插件类
 * 继承自思源笔记的 Plugin 基类，提供核心插件功能
 */
export default class RandomDocPlugin extends Plugin {
  /** 1.1 插件日志记录器 */
  public logger
  /** 1.2 是否为移动设备标志 */
  public isMobile: boolean
  /** 1.3 内核API封装，用于与思源内核交互 */
  public kernelApi: KernelApi

  /** 1.4 自定义标签页对象 */
  public customTabObject: () => IModel
  /** 1.5 标签页实例引用 */
  public tabInstance
  /** 1.6 标签页内容实例引用 */
  public tabContentInstance
  /** 1.7 移动端对话框引用 */
  public mobileDialog
  /** 1.8 最大化窗口容器引用 */
  public fullscreenContainer: HTMLElement | null = null
  /** 1.9 最大化窗口模式消息显示函数 */
  public showFullscreenMessage: any = null
  /** 1.10 主页面浮动按钮引用 */
  public floatingButton: HTMLElement | null = null
  /** 1.11 页面观察器引用 */
  public pageObserver: MutationObserver | null = null
  /** 1.12 紫色浮动按钮组件实例 */
  public purpleButtonInstance: any = null
  /** 1.13 紫色浮动按钮观察器 */
  public purpleButtonObserver: MutationObserver | null = null

  /**
   * 1.12 清理所有已存在的漫游实例
   * 确保在创建新实例前清理旧实例，避免重复显示
   */
  private cleanupExistingInstances() {
    try {
      // 清理标签页内容实例
      if (this.tabContentInstance) {
        this.tabContentInstance.$destroy()
        this.tabContentInstance = null
        this.logger.info("已清理标签页内容实例")
      }

      // 清理全屏容器
      if (this.fullscreenContainer) {
        this.fullscreenContainer.remove()
        this.fullscreenContainer = null
        this.logger.info("已清理全屏容器")
      }

      // 清理消息容器
      const messageContainer = document.getElementById("fullscreen-message-container")
      if (messageContainer) {
        messageContainer.remove()
        this.logger.info("已清理消息容器")
      }

      // 清理可能存在的全屏容器
      const existingFullscreenContainer = document.getElementById("fullscreen-random-doc")
      if (existingFullscreenContainer) {
        existingFullscreenContainer.remove()
        this.logger.info("已清理已存在的全屏容器")
      }

      // 清理自定义消息函数
      if (this.showFullscreenMessage) {
        delete this.showFullscreenMessage
        this.logger.info("已清理自定义消息函数")
      }

      // 清理标签页实例引用
      if (this.tabInstance) {
        delete this.tabInstance
        this.logger.info("已清理标签页实例引用")
      }

    } catch (error) {
      this.logger.error("清理已存在实例时出错:", error)
    }
  }

  /**
   * 1.7 插件构造函数
   * 初始化插件基础设施
   * 
   * @param options 插件初始化选项
   */
  constructor(options: { app: App; id: string; name: string; i18n: IObject }) {
    super(options)

    // 1.7.1 初始化日志记录器
    this.logger = simpleLogger("index", "incremental-reading", isDev)
    // 1.7.2 检测前端环境
    const frontEnd = getFrontend()
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile"
    // 1.7.3 初始化内核API
    this.kernelApi = new KernelApi()
  }

  /**
   * 2. 插件加载方法
   * 当插件被思源笔记加载时调用，用于初始化插件功能
   */
  async onload() {
    // 2.1 初始化顶栏按钮
    await initTopbar(this)
    // 2.2 注册插件命令（快捷键）
    await registerCommand(this)
    // 2.3 初始化主页面浮动按钮（手机端友好）
    await initFloatingButton(this)
  }

  /**
   * 2.1 插件卸载方法
   * 当插件被关闭或应用退出时调用，用于清理资源
   */
  onunload() {
    // 2.1.1 清理文档总数缓存
    IncrementalReviewer.clearAllCache()
    
    // 2.1.2 清理浮动按钮
    if (this.floatingButton) {
      const { removeFloatingButton } = require("./floatingButton")
      removeFloatingButton(this)
    }
    
    this.logger.info("插件已卸载，缓存已清理")
  }

  // openSetting() {
  //   showSettingMenu(this)
  // }

  /**
   * 3. 工具方法
   */
  
  /**
   * 3.1 安全的加载配置
   * 确保即使配置加载失败也返回一个有效对象
   *
   * @param storeName 存储键名
   * @returns 配置对象
   */
  public async safeLoad(storeName: string) {
    let storeConfig = await this.loadData(storeName)

    if (typeof storeConfig !== "object") {
      storeConfig = {}
    }

    return storeConfig
  }
}
