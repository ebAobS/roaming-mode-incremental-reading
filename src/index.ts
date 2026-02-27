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
import { isDev, storeName } from "./Constants"
import { initTopbar, registerCommand } from "./topbar"
import KernelApi from "./api/kernel-api"
import IncrementalReviewer from "./service/IncrementalReviewer"
import { initFloatingButton } from "./floatingButton"
import PluginSidebar from "./libs/PluginSidebar.svelte"
import { icons } from "./utils/svg"

/**
 * 1. 漫游式渐进阅读插件类
 * 继承自思源笔记的 Plugin 基类，提供核心插件功能
 */
export default class RandomDocPlugin extends Plugin {
  /** 1.1 插件日志记录器 */
  public logger
  /** 1.1.1 日志底层实例 */
  private baseLogger
  /** 1.1.2 是否启用调试日志 */
  private debugLogEnabled = false
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
  /** 1.12 侧边栏面板实例引用 */
  public dockInstance: any = null
  /** 1.13 侧边栏组件实例引用 */
  public dockContentInstance: any = null

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
    this.baseLogger = simpleLogger("index", "incremental-reading", isDev)
    this.logger = this.createLoggerProxy()
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
    const initConfig = await this.safeLoad(storeName)
    this.setDebugLogEnabled(initConfig?.enableDebugLog === true)

    // 2.1 初始化顶栏按钮
    await initTopbar(this)
    // 2.2 注册插件命令（快捷键）
    await registerCommand(this)
    // 2.3 初始化主页面浮动按钮（手机端友好）
    await initFloatingButton(this)
    // 2.4 初始化侧边栏面板
    await this.initSidebar()
  }

  /**
   * 2.1 插件卸载方法
   * 当插件被关闭或应用退出时调用，用于清理资源
   */
  onunload() {
    // 2.1.1 清理文档总数缓存
    // IncrementalReviewer.clearAllCache() // 方法不存在，暂时注释
    
    // 2.1.2 清理浮动按钮
    if (this.floatingButton) {
      import("./floatingButton").then(({ removeFloatingButton }) => {
        removeFloatingButton(this)
      })
    }
    
    // 2.1.3 清理侧边栏面板
    if (this.dockContentInstance) {
      this.dockContentInstance.$destroy()
      this.dockContentInstance = null
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

    // 确保返回的是对象且不是 null
    if (!storeConfig || typeof storeConfig !== "object" || Array.isArray(storeConfig)) {
      // 导入配置模型以获取默认值
      const RandomDocConfig = (await import("./models/RandomDocConfig")).default
      storeConfig = new RandomDocConfig()
    }

    return storeConfig
  }

  public setDebugLogEnabled(enabled: boolean) {
    this.debugLogEnabled = !!enabled
    if (this.kernelApi && typeof this.kernelApi.setDebugLogEnabled === "function") {
      this.kernelApi.setDebugLogEnabled(this.debugLogEnabled)
    }
  }

  public isDebugLogEnabled() {
    return this.debugLogEnabled
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

  /**
   * 3.2 初始化侧边栏面板
   * 在思源笔记侧边栏中创建一个新的面板用于显示插件相关内容
   */
  private async initSidebar() {
    try {
      const DOCK_TYPE = "plugin_sidebar"
      const pluginInstance = this // 保存插件实例引用，用于闭包
      // 构建完整的 data-type，格式：插件名 + type
      const fullDockType = `${this.name}${DOCK_TYPE}`
      
      // 3.2.1 添加侧边栏面板
      // 注意：icon 字段只支持内置图标名称字符串，不支持 SVG，需要在 init 中手动设置
      const dockResult = this.addDock({
        config: {
          position: "RightTop",
          size: { width: 300, height: 0 },
          icon: "iconRefresh",
          title: this.i18n.sidebarTitle || "漫游式渐进阅读",
        },
        data: {
          id: DOCK_TYPE,
        },
        type: DOCK_TYPE,
        init: function() {
          // 初始化时创建组件实例
          // 注意：这里的 this 指向 IDockModel，不是插件实例
          const dockModel = this as any
          
          // 3.2.1.1 设置自定义 SVG 图标
          // 延迟执行以确保 DOM 已完全渲染
          setTimeout(() => {
            try {
              // 通过 data-type 属性找到对应的 dock item
              const dockItem = document.querySelector(`span[data-type="${fullDockType}"]`) as HTMLElement
              
              if (dockItem) {
                // 查找 SVG 元素
                let svgElement = dockItem.querySelector('svg')
                
                if (svgElement) {
                  // 创建临时容器来解析 SVG 字符串
                  const tempDiv = document.createElement('div')
                  tempDiv.innerHTML = icons.iconBook.trim()
                  const newSvg = tempDiv.querySelector('svg')
                  
                  if (newSvg) {
                    // 设置新 SVG 的属性
                    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
                    newSvg.setAttribute('viewBox', '0 0 448 512')
                    newSvg.setAttribute('width', '1em')
                    newSvg.setAttribute('height', '1em')
                    
                    // 直接替换整个 SVG 元素（包括内部的 use 标签）
                    svgElement.outerHTML = newSvg.outerHTML
                    pluginInstance.logger.info("自定义 SVG 图标设置成功")
                  } else {
                    pluginInstance.logger.warn("无法解析 SVG 图标字符串")
                  }
                } else {
                  // 如果没有找到 SVG 元素，创建一个新的
                  const tempDiv = document.createElement('div')
                  tempDiv.innerHTML = icons.iconBook.trim()
                  const newSvg = tempDiv.querySelector('svg')
                  
                  if (newSvg) {
                    newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
                    newSvg.setAttribute('viewBox', '0 0 448 512')
                    newSvg.setAttribute('width', '1em')
                    newSvg.setAttribute('height', '1em')
                    
                    // 插入到 dock item 的开头
                    if (dockItem.firstChild) {
                      dockItem.insertBefore(newSvg, dockItem.firstChild)
                    } else {
                      dockItem.appendChild(newSvg)
                    }
                    pluginInstance.logger.info("自定义 SVG 图标通过创建新元素设置成功")
                  }
                }
              } else {
                pluginInstance.logger.warn(`无法找到 dock item，选择器: span[data-type="${fullDockType}"]`)
              }
            } catch (iconError) {
              pluginInstance.logger.error("设置自定义图标失败:", iconError)
            }
          }, 100)
          
          // 3.2.1.2 创建侧边栏内容组件
          if (dockModel && dockModel.element) {
            pluginInstance.dockContentInstance = new PluginSidebar({
              target: dockModel.element as HTMLElement,
              props: {
                pluginInstance: pluginInstance,
              },
            })
            pluginInstance.logger.info("侧边栏面板组件已创建", {
              hasElement: !!dockModel.element,
              elementType: dockModel.element?.tagName
            })
          } else {
            pluginInstance.logger.error("侧边栏面板初始化失败：element 不可用", {
              hasDockModel: !!dockModel,
              hasElement: !!(dockModel && dockModel.element)
            })
          }
        },
        destroy: function() {
          // 销毁时清理组件实例
          // 注意：这里的 this 指向 IDockModel
          if (pluginInstance.dockContentInstance) {
            pluginInstance.dockContentInstance.$destroy()
            pluginInstance.dockContentInstance = null
            pluginInstance.logger.info("侧边栏面板组件已销毁")
          }
        },
      })

      // 保存 dock model 引用
      this.dockInstance = dockResult.model

      this.logger.info("侧边栏面板初始化成功", {
        hasModel: !!dockResult.model,
        hasElement: !!(dockResult.model && dockResult.model.element),
        fullDockType: fullDockType
      })
    } catch (error) {
      this.logger.error("初始化侧边栏面板失败:", error)
    }
  }
}
