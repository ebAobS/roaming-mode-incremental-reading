/**
 * 移动端浮动按钮：在手机端呼出侧边栏浮窗，触发漫游或打开设置。
 */

import type RandomDocPlugin from "./index"
import { icons } from "./utils/svg"
import { showSettingMenu } from "./topbar"
import MobileSidebarDialog from "./libs/MobileSidebarDialog.svelte"

export async function initFloatingButton(pluginInstance: RandomDocPlugin) {
  if (!pluginInstance.isMobile) {
    pluginInstance.logger.info("桌面端不显示浮动按钮")
    return
  }

  const button = document.createElement("div")
  button.id = "incremental-reading-floating-btn"
  button.className = "incremental-reading-floating"
  button.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    user-select: none;
    opacity: 0.9;
  `
  button.innerHTML = `<div style="color: white;font-size: 20px;display: flex;align-items: center;justify-content: center;width: 100%;height: 100%;">${icons.iconTopbar}</div>`

  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.1)"
    button.style.boxShadow = "0 6px 25px rgba(102, 126, 234, 0.6)"
  })
  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)"
    button.style.boxShadow = "0 4px 20px rgba(102, 126, 234, 0.4)"
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

  button.addEventListener("click", openMobileDialog)
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
