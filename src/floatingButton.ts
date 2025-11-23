/**
 * 移动端浮动按钮：在手机端呼出侧边栏浮窗，触发漫游或打开设置。
 */

import type RandomDocPlugin from "./index"
import { icons } from "./utils/svg"
import { showSettingMenu } from "./topbar"
import MobileSidebarDialog from "./libs/MobileSidebarDialog.svelte"
import PluginSidebar from "./libs/PluginSidebar.svelte"
import { openMobileFileById, showMessage } from "siyuan"
import { storeName } from "./Constants"
import IncrementalReviewer from "./service/IncrementalReviewer"

export async function initFloatingButton(pluginInstance: RandomDocPlugin) {
  if (!pluginInstance.isMobile) {
    pluginInstance.logger.info("桌面端不显示浮动按钮")
    return
  }

  const button = document.createElement("div")
  button.id = "incremental-reading-floating-btn"
  button.className = "incremental-reading-floating"
  
  // 从localStorage加载保存的位置
  const savedPos = localStorage.getItem("incremental-reading-floating-pos")
  let posStyle = "bottom: 80px; right: 20px;"
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos)
      posStyle = `top: ${pos.top}px; left: ${pos.left}px;`
    } catch (e) {
      console.error("加载浮动按钮位置失败", e)
    }
  }
  
  button.style.cssText = `
    position: fixed;
    ${posStyle}
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(6, 182, 212, 0.4);
    cursor: move;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    user-select: none;
    opacity: 0.9;
  `
  button.innerHTML = `<div style="color: white;font-size: 16px;display: flex;align-items: center;justify-content: center;width: 100%;height: 100%;">${icons.iconTopbar}</div>`

  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.1)"
    button.style.boxShadow = "0 4px 18px rgba(6, 182, 212, 0.6)"
  })
  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)"
    button.style.boxShadow = "0 2px 12px rgba(6, 182, 212, 0.4)"
  })

  // 拖动功能
  let isDragging = false
  let hasMoved = false
  let justDragged = false
  let startX = 0
  let startY = 0
  let initialLeft = 0
  let initialTop = 0

  button.addEventListener("touchstart", (e) => {
    const touch = e.touches[0]
    isDragging = true
    hasMoved = false
    justDragged = false
    startX = touch.clientX
    startY = touch.clientY
    
    const rect = button.getBoundingClientRect()
    initialLeft = rect.left
    initialTop = rect.top
    
    button.style.transition = "none"
  })

  button.addEventListener("touchmove", (e) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    
    // 如果移动超过5px，认为是拖动
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true
      
      const newLeft = initialLeft + deltaX
      const newTop = initialTop + deltaY
      
      // 限制在屏幕范围内
      const maxLeft = window.innerWidth - button.offsetWidth
      const maxTop = window.innerHeight - button.offsetHeight
      
      const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft))
      const boundedTop = Math.max(0, Math.min(newTop, maxTop))
      
      button.style.left = boundedLeft + "px"
      button.style.top = boundedTop + "px"
      button.style.right = "auto"
      button.style.bottom = "auto"
      
      e.preventDefault()
    }
  })

  button.addEventListener("touchend", (e) => {
    if (isDragging) {
      isDragging = false
      button.style.transition = "box-shadow 0.3s ease, transform 0.3s ease"
      
      if (hasMoved) {
        justDragged = true
        
        // 保存位置到localStorage
        const rect = button.getBoundingClientRect()
        localStorage.setItem("incremental-reading-floating-pos", JSON.stringify({
          left: rect.left,
          top: rect.top
        }))
        
        // 阻止点击事件
        e.preventDefault()
        e.stopPropagation()
        
        // 300ms后重置标记
        setTimeout(() => {
          justDragged = false
        }, 300)
      }
      
      hasMoved = false
    }
  })

  let dialogHost: HTMLElement | null = null

  const destroyMobileDialog = () => {
    if (pluginInstance.mobileDialog) {
      try {
        pluginInstance.mobileDialog.$destroy()
      } catch (error) {
        pluginInstance.logger.error("销毁移动端浮窗失败", error)
      }
      pluginInstance.mobileDialog = null
    }
    if (dialogHost) {
      dialogHost.remove()
      dialogHost = null
    }
  }

  const openMobileDialog = () => {
    if (pluginInstance.mobileDialog) {
      return
    }

    const existingHost = document.getElementById("incremental-reading-mobile-dialog")
    if (existingHost) {
      existingHost.remove()
    }

    dialogHost = document.createElement("div")
    dialogHost.id = "incremental-reading-mobile-dialog"
    document.body.appendChild(dialogHost)

    pluginInstance.mobileDialog = new MobileSidebarDialog({
      target: dialogHost,
      props: {
        pluginInstance,
        onClose: destroyMobileDialog,
      },
    })
  }

  button.addEventListener("click", async () => {
    // 如果刚刚发生了拖动，不执行点击
    if (justDragged) {
      return
    }

    const dockInstance = pluginInstance.dockContentInstance as any
    if (dockInstance?.triggerRoam) {
      try {
        await dockInstance.triggerRoam()
        return
      } catch (error) {
        pluginInstance.logger?.error("侧栏漫游调用失败，使用兜底逻辑", error)
      }
    }

    // 移动端直接漫游策略：获取随机文档 → 使用 openMobileFileById 打开
    try {
      // console.log("[移动端漫游] 开始...")
      
      // 1. 加载配置
      const storeConfig = await pluginInstance.safeLoad(storeName)
      
      // 2. 创建 reviewer 实例
      const reviewer = new IncrementalReviewer(storeConfig, pluginInstance)
      await reviewer.initIncrementalConfig()
      
      // 3. 获取随机文档
      const result = await reviewer.getRandomDoc(storeConfig)
      let docId: string | undefined
      
      if (typeof result === "object" && result !== null && "docId" in result) {
        docId = result.docId as string
      } else {
        docId = result as string
      }
      
      if (!docId) {
        showMessage("没有符合条件的文档", 3000, "info")
        return
      }
      
      // console.log("[移动端漫游] 获取到文档ID:", docId)
      
      // 4. 验证文档存在
      const blockResult = await pluginInstance.kernelApi.getBlockByID(docId)
      if (!blockResult) {
        showMessage("文档不存在或已删除", 3000, "error")
        return
      }
      
      // 5. 记录漫游次数
      try {
        await reviewer.incrementRoamingCount(docId)
      } catch (error) {
        console.error("[移动端漫游] 记录次数失败:", error)
      }
      
      // 6. 保存当前文档ID
      ;(storeConfig as any).currentRndId = docId
      await pluginInstance.saveData(storeName, storeConfig)
      
      // 7. 延迟后打开文档（模仿 MobileFloatingActions 的流程）
      // console.log("[移动端漫游] 准备打开文档...")
      setTimeout(async () => {
        try {
          // 使用移动端专用API打开文档（action 传空数组）
          await openMobileFileById(pluginInstance.app, docId!, [])
          console.log("[移动端漫游] 文档打开成功")
          // showMessage("已跳转到随机文档", 2000, "info")
        } catch (openError: any) {
          console.error("[移动端漫游] 打开失败:", openError)
          showMessage("打开文档失败", 3000, "error")
        }
      }, 50)
      
    } catch (error: any) {
      console.error("[移动端漫游] 失败:", error)
      showMessage("漫游失败: " + (error?.message || ""), 3000, "error")
    }
  })
  
  button.addEventListener("contextmenu", (e) => {
    e.preventDefault()
    showSettingMenu(pluginInstance)
  })

  document.body.appendChild(button)
  pluginInstance.floatingButton = button
}

export function removeFloatingButton(pluginInstance: RandomDocPlugin) {
  if (pluginInstance.floatingButton) {
    pluginInstance.floatingButton.remove()
    pluginInstance.floatingButton = null
  }
  if (pluginInstance.mobileDialog) {
    try {
      pluginInstance.mobileDialog.$destroy()
    } catch (error) {
      pluginInstance.logger.error("销毁移动端浮窗失败", error)
    }
    pluginInstance.mobileDialog = null
  }
  const host = document.getElementById("incremental-reading-mobile-dialog")
  if (host) {
    host.remove()
  }
}
