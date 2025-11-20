/**
 * 顶栏入口：触发侧边栏漫游或打开设置。
 */

import RandomDocPlugin from "./index"
import { icons } from "./utils/svg"
import { Dialog, showMessage } from "siyuan"
import RandomDocSetting from "./libs/RandomDocSetting.svelte"

export async function initTopbar(pluginInstance: RandomDocPlugin) {
  const topBarElement = pluginInstance.addTopBar({
    icon: icons.iconTopbar,
    title: pluginInstance.i18n.randomDoc,
    position: "right",
    callback: () => {},
  })

  topBarElement.addEventListener("click", async () => {
    if (pluginInstance.dockContentInstance?.triggerRoam) {
      pluginInstance.dockContentInstance.triggerRoam()
    } else {
      showMessage("侧边栏未就绪，请稍后重试", 3000, "error")
    }
  })

  topBarElement.addEventListener("contextmenu", () => {
    showSettingMenu(pluginInstance)
  })
}

export const showSettingMenu = (pluginInstance: RandomDocPlugin) => {
  const settingId = "siyuan-random-doc-setting"
  const d = new Dialog({
    title: `${pluginInstance.i18n.setting} - ${pluginInstance.i18n.randomDoc}`,
    content: `<div id="${settingId}"></div>`,
    width: pluginInstance.isMobile ? "92vw" : "720px",
  })

  setTimeout(() => {
    const dialogElement = d.element
    if (dialogElement) {
      dialogElement.style.zIndex = "10000"
      const backdrop = dialogElement.previousElementSibling
      if (backdrop && backdrop.classList.contains("b3-dialog__backdrop")) {
        ;(backdrop as HTMLElement).style.zIndex = "9999"
      }
    }
  }, 50)

  new RandomDocSetting({
    target: document.getElementById(settingId) as HTMLElement,
    props: {
      pluginInstance: pluginInstance,
      dialog: d,
    },
  })
}

export async function registerCommand(pluginInstance: RandomDocPlugin) {
  pluginInstance.addCommand({
    langKey: "startRandomDoc",
    hotkey: "⌥⌘M",
    callback: async () => {
      if (pluginInstance.dockContentInstance?.triggerRoam) {
        pluginInstance.dockContentInstance.triggerRoam()
      } else {
        showMessage("侧边栏未就绪，请稍后重试", 3000, "error")
      }
    },
  })

  pluginInstance.addCommand({
    langKey: "continueRandomDoc",
    hotkey: "⌥⌘C",
    callback: async () => {
      if (pluginInstance.dockContentInstance?.triggerRoam) {
        pluginInstance.dockContentInstance.triggerRoam()
      } else {
        showMessage("侧边栏未就绪，请稍后重试", 3000, "error")
      }
    },
  })

  pluginInstance.addCommand({
    langKey: "resetAllVisits",
    hotkey: "⌥⌘V",
    callback: async () => {
      if (pluginInstance.dockContentInstance?.resetVisitedFromOutside) {
        await pluginInstance.dockContentInstance.resetVisitedFromOutside()
      } else {
        showMessage("请先打开侧边栏面板再操作", 3000, "info")
      }
    },
  })
}
