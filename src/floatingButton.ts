/**
 * 移动端浮动按钮：快速触发侧边栏漫游或打开设置。
 */

import type RandomDocPlugin from "./index"
import { showMessage } from "siyuan"
import { icons } from "./utils/svg"
import { showSettingMenu } from "./topbar"

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

  const triggerRoam = () => {
    const sidebar = pluginInstance.dockContentInstance
    if (sidebar?.triggerRoam) {
      sidebar.triggerRoam()
    } else {
      showMessage("侧边栏未就绪，请稍后重试", 3000, "error")
    }
  }

  button.addEventListener("click", () => triggerRoam())
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
}
