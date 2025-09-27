/**
 * ========================================
 * 漫游式渐进阅读插件 - 主页面浮动按钮
 * ========================================
 * 
 * 本文件实现了在思源笔记主页面添加浮动快捷按钮的功能，
 * 为手机端用户提供更便捷的漫游功能访问方式。
 * 
 * ## 功能特点
 * 1. 主页面浮动按钮 - 始终可见的快速启动入口
 * 2. 手机端优化 - 大按钮设计，便于触摸操作
 * 3. 智能隐藏 - 在非主页面时自动隐藏
 * 4. 状态同步 - 显示当前漫游状态
 */

import type RandomDocPlugin from "./index"
import { showMessage } from "siyuan"
import { icons } from "./utils/svg"

/**
 * 初始化主页面浮动按钮
 * 在思源笔记的主页面添加一个浮动的快速启动按钮
 *
 * @param pluginInstance 插件实例
 */
export async function initFloatingButton(pluginInstance: RandomDocPlugin) {
  try {
    // 只在手机端显示浮动按钮
    if (!pluginInstance.isMobile) {
      pluginInstance.logger.info("桌面端不显示浮动按钮，请使用顶栏按钮")
      return
    }

    // 动态导入紫色浮动按钮组件
    const { default: PurpleFloatingButton } = await import('./libs/components/PurpleFloatingButton.svelte')
    
    // 创建容器元素
    const container = document.createElement('div')
    container.id = 'purple-floating-button-container'
    document.body.appendChild(container)
    
    // 创建紫色浮动按钮组件实例
    const buttonInstance = new PurpleFloatingButton({
      target: container,
      props: {
        pluginInstance: pluginInstance,
        onStartRoaming: () => startRoamingFromFloatingButton(pluginInstance)
      }
    })
    
    // 保存引用
    pluginInstance.floatingButton = container
    pluginInstance.purpleButtonInstance = buttonInstance
    
    pluginInstance.logger.info("主页面浮动按钮初始化成功")
    
  } catch (error) {
    pluginInstance.logger.error("初始化浮动按钮失败:", error)
    showMessage("快速启动按钮初始化失败，请使用顶栏按钮", 3000, "warning")
  }
}



/**
 * 从浮动按钮启动漫游功能
 */
async function startRoamingFromFloatingButton(pluginInstance: RandomDocPlugin) {
  try {
    // 在创建新实例前，先清理所有已存在的实例
    pluginInstance.cleanupExistingInstances()
    
    // 导入topbar模块中的triggerRandomDoc函数
    const topbarModule = await import('./topbar')
    
    // 由于triggerRandomDoc是内部函数，我们需要调用initTopbar中的逻辑
    // 这里我们重新实现移动端的最大化窗口逻辑
    
    // 创建最大化容器
    const fullscreenContainer = document.createElement('div')
    fullscreenContainer.id = "fullscreen-random-doc"
    fullscreenContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--b3-theme-background);
      z-index: 9998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `
    
    // 创建头部
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--b3-theme-surface);
      border-bottom: 1px solid var(--b3-theme-border);
      flex-shrink: 0;
    `
    
    // 创建标题
    const title = document.createElement('h2')
    title.textContent = pluginInstance.i18n.randomDoc || "渐进式阅读漫游"
    title.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--b3-theme-on-background);
    `
    
    // 创建返回按钮
    const backButton = document.createElement('button')
    backButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    `
    backButton.style.cssText = `
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      border-radius: 6px;
      color: var(--b3-theme-on-background);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    `
    
    // 返回按钮事件
    backButton.addEventListener('click', () => {
      closeFullscreenModeFromFloating(pluginInstance, fullscreenContainer)
    })
    
    // 组装头部
    header.appendChild(backButton)
    header.appendChild(title)
    header.appendChild(document.createElement('div')) // 占位符
    
    // 创建内容区域
    const contentArea = document.createElement('div')
    contentArea.id = "fullscreen-content"
    contentArea.style.cssText = `
      flex: 1;
      overflow: auto;
      padding: 0;
    `
    
    // 组装容器
    fullscreenContainer.appendChild(header)
    fullscreenContainer.appendChild(contentArea)
    
    // 添加到页面
    document.body.appendChild(fullscreenContainer)
    
    // 动态导入RandomDocContent组件
    const { default: RandomDocContent } = await import('./libs/RandomDocContent.svelte')
    
    // 创建漫游内容组件
    pluginInstance.tabContentInstance = new RandomDocContent({
      target: contentArea,
      props: {
        pluginInstance: pluginInstance,
      },
    })
    
    // 保存引用
    pluginInstance.fullscreenContainer = fullscreenContainer
    
    showMessage('渐进式阅读漫游已启动', 2000, 'info')
    
  } catch (error) {
    throw new Error('启动漫游失败: ' + error.message)
  }
}

/**
 * 关闭从浮动按钮启动的最大化模式
 */
function closeFullscreenModeFromFloating(pluginInstance: RandomDocPlugin, container: HTMLElement) {
  try {
    // 清理容器
    container.remove()
    
    // 清理组件实例
    if (pluginInstance.tabContentInstance) {
      pluginInstance.tabContentInstance.$destroy()
      pluginInstance.tabContentInstance = null
    }
    
    // 清理引用
    pluginInstance.fullscreenContainer = null
    
    pluginInstance.logger.info("从浮动按钮启动的漫游已关闭")
    
  } catch (error) {
    pluginInstance.logger.error("关闭浮动按钮漫游失败:", error)
  }
}


/**
 * 移除浮动按钮
 */
export function removeFloatingButton(pluginInstance: RandomDocPlugin) {
  try {
    // 销毁紫色浮动按钮组件实例
    if (pluginInstance.purpleButtonInstance) {
      pluginInstance.purpleButtonInstance.$destroy()
      pluginInstance.purpleButtonInstance = null
    }
    
    // 移除容器
    if (pluginInstance.floatingButton) {
      pluginInstance.floatingButton.remove()
      pluginInstance.floatingButton = null
    }
    
    // 清理观察器
    if (pluginInstance.pageObserver) {
      pluginInstance.pageObserver.disconnect()
      pluginInstance.pageObserver = null
    }
    
    if (pluginInstance.purpleButtonObserver) {
      pluginInstance.purpleButtonObserver.disconnect()
      pluginInstance.purpleButtonObserver = null
    }
    
    pluginInstance.logger.info("浮动按钮已移除")
    
  } catch (error) {
    pluginInstance.logger.error("移除浮动按钮失败:", error)
  }
}

