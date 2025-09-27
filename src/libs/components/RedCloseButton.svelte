<!--
  - 红色关闭按钮组件  
  - 用于在移动端显示红色的关闭浮动按钮
  -->

<script lang="ts">
  import type RandomDocPlugin from "../../index"

  // Props
  export let pluginInstance: RandomDocPlugin
  export let onCloseAction: () => void = () => {}

  let floatingBtn: HTMLElement
  let hasActuallyDragged = false
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0

  // 拖拽开始
  function startDrag(e: TouchEvent | MouseEvent) {
    hasActuallyDragged = false
    isDragging = false
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    startX = clientX
    startY = clientY
    
    if (floatingBtn) {
      const rect = floatingBtn.getBoundingClientRect()
      initialX = rect.left
      initialY = rect.top
    }
  }

  // 拖拽进行中
  function onDrag(e: TouchEvent | MouseEvent) {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const deltaX = clientX - startX
    const deltaY = clientY - startY
    
    // 如果移动距离超过阈值，开始拖拽
    if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isDragging = true
      hasActuallyDragged = true
      if (floatingBtn) {
        floatingBtn.style.transition = 'none'
      }
    }
    
    if (isDragging && floatingBtn) {
      const newX = initialX + deltaX
      const newY = initialY + deltaY
      
      // 限制在屏幕范围内
      const maxX = window.innerWidth - floatingBtn.offsetWidth
      const maxY = window.innerHeight - floatingBtn.offsetHeight
      
      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))
      
      floatingBtn.style.left = clampedX + 'px'
      floatingBtn.style.top = clampedY + 'px'
      floatingBtn.style.right = 'auto'
      floatingBtn.style.bottom = 'auto'
    }
  }

  // 拖拽结束
  function endDrag() {
    if (floatingBtn) {
      floatingBtn.style.transition = 'all 0.3s ease'
      
      // 拖拽结束后吸附到边缘
      if (isDragging) {
        const rect = floatingBtn.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const screenWidth = window.innerWidth
        
        // 吸附到左边或右边
        if (centerX < screenWidth / 2) {
          floatingBtn.style.left = '20px'
        } else {
          floatingBtn.style.left = 'auto'
          floatingBtn.style.right = '20px'
        }
        
        // 保存位置
        saveButtonPosition()
      }
    }
    
    isDragging = false
  }

  // 处理关闭按钮点击
  function handleCloseClick(e: Event) {
    if (hasActuallyDragged) {
      e.preventDefault()
      return
    }
    onCloseAction()
  }

  // 保存按钮位置
  function saveButtonPosition() {
    if (floatingBtn) {
      const position = {
        left: floatingBtn.style.left,
        right: floatingBtn.style.right,
        top: floatingBtn.style.top,
        bottom: floatingBtn.style.bottom
      }
      localStorage.setItem('red-close-button-position', JSON.stringify(position))
    }
  }

  // 恢复按钮位置
  function restoreButtonPosition() {
    try {
      const savedPosition = localStorage.getItem('red-close-button-position')
      if (savedPosition && floatingBtn) {
        const position = JSON.parse(savedPosition)
        if (position.left && position.left !== 'auto') {
          floatingBtn.style.left = position.left
          floatingBtn.style.right = 'auto'
        } else if (position.right && position.right !== 'auto') {
          floatingBtn.style.right = position.right
          floatingBtn.style.left = 'auto'
        }
        
        if (position.top && position.top !== 'auto') {
          floatingBtn.style.top = position.top
          floatingBtn.style.bottom = 'auto'
        } else if (position.bottom && position.bottom !== 'auto') {
          floatingBtn.style.bottom = position.bottom
          floatingBtn.style.top = 'auto'
        }
      }
    } catch (error) {
      pluginInstance.logger.warn('恢复红色关闭按钮位置失败:', error)
    }
  }

  // 组件挂载后恢复位置
  import { onMount } from 'svelte'
  
  onMount(() => {
    if (floatingBtn) {
      restoreButtonPosition()
    }
  })
</script>

<!-- 红色关闭按钮 -->
{#if pluginInstance.isMobile}
  <button 
    class="red-close-floating-btn" 
    bind:this={floatingBtn}
    on:click={handleCloseClick}
    on:mousedown={startDrag}
    on:mousemove={isDragging ? onDrag : null}
    on:mouseup={endDrag}
    on:touchstart={startDrag}
    on:touchmove={onDrag}
    on:touchend={endDrag}
  >
    ✕
  </button>
{/if}

<style lang="stylus">
  .red-close-floating-btn
    position: fixed !important
    bottom: 30px !important
    right: 30px !important
    width: 40px !important
    height: 40px !important
    border-radius: 20px !important
    background-color: #dc3545 !important
    color: white !important
    border: none !important
    font-size: 14px !important
    cursor: move !important
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important
    z-index: 9999 !important
    transition: all 0.3s ease !important
    display: flex !important
    align-items: center !important
    justify-content: center !important
    user-select: none !important
    -webkit-user-select: none !important
    touch-action: none !important
    
    &:hover
      background-color: #c82333 !important
      transform: scale(1.05) !important
    
    &:active
      background-color: #bd2130 !important
      transform: scale(0.95) !important
</style>

