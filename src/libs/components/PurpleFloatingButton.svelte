<!--
  - 主页面紫色浮动按钮组件
  - 负责在思源笔记主页面显示紫色渐变的启动按钮
  -->

<script lang="ts">
  import type RandomDocPlugin from "../../index"
  import { showMessage } from "siyuan"
  import { icons } from "../../utils/svg"

  // Props
  export let pluginInstance: RandomDocPlugin
  export let onStartRoaming: () => void = () => {}

  let floatingButton: HTMLElement
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0
  let hasMoved = false
  let pressTimer: any = null

  // 智能消息显示函数
  const smartShowMessage = (message: string, duration: number = 3000, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (pluginInstance.isMobile && pluginInstance.showFullscreenMessage) {
      pluginInstance.showFullscreenMessage(message, duration, type)
    } else {
      const siyuanType: 'info' | 'error' = (type === 'error') ? 'error' : 'info'
      showMessage(message, duration, siyuanType)
    }
  }

  // 处理按钮点击
  async function handleClick() {
    try {
      // 检查是否已经在漫游中
      const isRoaming = !!(pluginInstance.tabContentInstance || pluginInstance.fullscreenContainer)
      
      if (isRoaming) {
        smartShowMessage('漫游已在进行中', 2000, 'info')
        return
      }
      
      // 添加点击动画
      if (floatingButton) {
        floatingButton.style.transform = 'scale(0.95)'
        setTimeout(() => {
          floatingButton.style.transform = 'scale(1)'
        }, 150)
      }
      
      // 触发启动漫游回调
      onStartRoaming()
      
    } catch (error) {
      pluginInstance.logger.error("紫色浮动按钮启动漫游失败:", error)
      smartShowMessage("启动漫游失败: " + error.message, 3000, "error")
    }
  }

  // 拖拽开始
  function startDrag(e: TouchEvent | MouseEvent) {
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    startX = clientX
    startY = clientY
    
    if (floatingButton) {
      const rect = floatingButton.getBoundingClientRect()
      initialX = rect.left
      initialY = rect.top
    }
    
    isDragging = false
    hasMoved = false
    
    // 长按定时器（仅移动端）
    if ('touches' in e) {
      pressTimer = setTimeout(() => {
        if (!hasMoved) {
          showQuickMenu()
        }
      }, 800)
    }
  }

  // 拖拽进行中
  function onDrag(e: TouchEvent | MouseEvent) {
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const deltaX = clientX - startX
    const deltaY = clientY - startY
    
    // 如果移动距离超过阈值，开始拖拽
    if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isDragging = true
      if (floatingButton) {
        floatingButton.style.transition = 'none' // 拖拽时禁用过渡动画
      }
    }
    
    if (isDragging && floatingButton) {
      hasMoved = true
      const newX = initialX + deltaX
      const newY = initialY + deltaY
      
      // 限制在屏幕范围内
      const maxX = window.innerWidth - 60
      const maxY = window.innerHeight - 60
      const constrainedX = Math.max(20, Math.min(maxX, newX))
      const constrainedY = Math.max(20, Math.min(maxY, newY))
      
      floatingButton.style.left = constrainedX + 'px'
      floatingButton.style.top = constrainedY + 'px'
      floatingButton.style.right = 'auto'
      floatingButton.style.bottom = 'auto'
    }
  }

  // 拖拽结束
  function endDrag() {
    if (pressTimer) {
      clearTimeout(pressTimer)
      pressTimer = null
    }
    
    if (floatingButton) {
      // 恢复过渡动画
      floatingButton.style.transition = 'all 0.3s ease'
      
      // 拖拽结束后吸附到边缘
      if (isDragging) {
        const rect = floatingButton.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const screenWidth = window.innerWidth
        
        // 吸附到左边或右边
        if (centerX < screenWidth / 2) {
          floatingButton.style.left = '20px'
        } else {
          floatingButton.style.left = 'auto'
          floatingButton.style.right = '20px'
        }
        
        // 保存位置
        saveButtonPosition()
      }
    }
    
    // 如果没有拖拽且没有移动，触发点击
    if (!isDragging && !hasMoved) {
      handleClick()
    }
    
    isDragging = false
    hasMoved = false
  }

  // 保存按钮位置
  function saveButtonPosition() {
    if (floatingButton) {
      const position = {
        left: floatingButton.style.left,
        right: floatingButton.style.right,
        top: floatingButton.style.top,
        bottom: floatingButton.style.bottom
      }
      localStorage.setItem('purple-floating-button-position', JSON.stringify(position))
    }
  }

  // 恢复按钮位置
  function restoreButtonPosition() {
    try {
      const savedPosition = localStorage.getItem('purple-floating-button-position')
      if (savedPosition && floatingButton) {
        const position = JSON.parse(savedPosition)
        if (position.left && position.left !== 'auto') {
          floatingButton.style.left = position.left
          floatingButton.style.right = 'auto'
        } else if (position.right && position.right !== 'auto') {
          floatingButton.style.right = position.right
          floatingButton.style.left = 'auto'
        }
        
        if (position.top && position.top !== 'auto') {
          floatingButton.style.top = position.top
          floatingButton.style.bottom = 'auto'
        } else if (position.bottom && position.bottom !== 'auto') {
          floatingButton.style.bottom = position.bottom
          floatingButton.style.top = 'auto'
        }
      }
    } catch (error) {
      pluginInstance.logger.warn('恢复紫色浮动按钮位置失败:', error)
    }
  }

  // 显示快速菜单（长按触发）
  function showQuickMenu() {
    // 震动反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // 创建快速菜单
    const menu = document.createElement('div')
    menu.style.cssText = `
      position: fixed;
      bottom: 150px;
      right: 20px;
      background: var(--b3-theme-surface);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      padding: 8px 0;
      z-index: 1001;
      min-width: 120px;
    `
    
    // 菜单项：打开设置
    const settingItem = document.createElement('div')
    settingItem.textContent = '插件设置'
    settingItem.style.cssText = `
      padding: 12px 16px;
      cursor: pointer;
      color: var(--b3-theme-on-surface);
      transition: background-color 0.2s;
    `
    
    settingItem.addEventListener('click', async () => {
      menu.remove()
      try {
        const { showSettingMenu } = await import('../../topbar')
        showSettingMenu(pluginInstance)
      } catch (error) {
        smartShowMessage('打开设置失败', 3000, 'error')
      }
    })
    
    menu.appendChild(settingItem)
    document.body.appendChild(menu)
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
      const closeMenu = () => {
        menu.remove()
        document.removeEventListener('click', closeMenu)
      }
      document.addEventListener('click', closeMenu)
    }, 100)
  }

  // 检查是否在主页面
  function checkIsHomePage() {
    return !document.querySelector('.layout-tab-container .protyle') && 
           !document.querySelector('.sy__file') &&
           document.querySelector('.b3-list')
  }

  // 设置页面可见性控制
  function setupVisibilityControl() {
    if (!floatingButton) return

    const updateVisibility = () => {
      const isHome = checkIsHomePage()
      floatingButton.style.display = isHome ? 'flex' : 'none'
    }
    
    // 初始检查
    updateVisibility()
    
    // 监听DOM变化
    const observer = new MutationObserver(updateVisibility)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // 监听路由变化
    window.addEventListener('popstate', updateVisibility)
    
    // 保存observer用于清理
    pluginInstance.purpleButtonObserver = observer
  }

  // 组件挂载后初始化
  import { onMount, onDestroy } from 'svelte'
  
  onMount(() => {
    if (floatingButton) {
      restoreButtonPosition()
      setupVisibilityControl()
    }
  })

  onDestroy(() => {
    if (pluginInstance.purpleButtonObserver) {
      pluginInstance.purpleButtonObserver.disconnect()
      pluginInstance.purpleButtonObserver = null
    }
  })
</script>

<!-- 紫色主页浮动按钮 -->
{#if pluginInstance.isMobile}
  <button
    bind:this={floatingButton}
    class="purple-floating-button"
    on:click={!isDragging && !hasMoved ? handleClick : null}
    on:mousedown={startDrag}
    on:mousemove={isDragging ? onDrag : null}
    on:mouseup={endDrag}
    on:touchstart={startDrag}
    on:touchmove={onDrag}
    on:touchend={endDrag}
    type="button"
    aria-label="启动漫游式渐进阅读"
    title="启动漫游式渐进阅读"
  >
    <div class="button-icon">
      {@html icons.iconTopbar}
    </div>
  </button>
{/if}

<style lang="stylus">
  .purple-floating-button
    position: fixed !important
    bottom: 80px !important
    right: 20px !important
    width: 60px !important
    height: 60px !important
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important
    border: none !important
    border-radius: 50% !important
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4) !important
    cursor: pointer !important
    z-index: 1000 !important
    display: flex !important
    align-items: center !important
    justify-content: center !important
    transition: all 0.3s ease !important
    user-select: none !important
    -webkit-user-select: none !important
    touch-action: none !important
    opacity: 0.9 !important
    
    &:hover
      transform: scale(1.1) !important
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6) !important
    
    &:active
      transform: scale(0.95) !important

  .button-icon
    color: white !important
    font-size: 24px !important
    display: flex !important
    align-items: center !important
    justify-content: center !important
    width: 100% !important
    height: 100% !important
</style>

