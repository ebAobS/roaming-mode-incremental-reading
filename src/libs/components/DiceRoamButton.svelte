<!--
  - 筛子漫游按钮组件
  - 用于在移动端显示蓝色的筛子图标漫游按钮
  -->

<script lang="ts">
  import type RandomDocPlugin from "../../index"

  // Props
  export let pluginInstance: RandomDocPlugin
  export let isLoading: boolean = false
  export let onRoamAction: () => void = () => {}

  let floatingRoamBtn: HTMLElement
  let hasRoamActuallyDragged = false
  let isRoamDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0

  // 拖拽开始
  function startRoamDrag(e: TouchEvent | MouseEvent) {
    hasRoamActuallyDragged = false
    isRoamDragging = false
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    startX = clientX
    startY = clientY
    
    if (floatingRoamBtn) {
      const rect = floatingRoamBtn.getBoundingClientRect()
      initialX = rect.left
      initialY = rect.top
    }
  }

  // 拖拽进行中
  function onRoamDrag(e: TouchEvent | MouseEvent) {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const deltaX = clientX - startX
    const deltaY = clientY - startY
    
    // 如果移动距离超过阈值，开始拖拽
    if (!isRoamDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      isRoamDragging = true
      hasRoamActuallyDragged = true
      if (floatingRoamBtn) {
        floatingRoamBtn.style.transition = 'none'
      }
    }
    
    if (isRoamDragging && floatingRoamBtn) {
      const newX = initialX + deltaX
      const newY = initialY + deltaY
      
      // 限制在屏幕范围内
      const maxX = window.innerWidth - floatingRoamBtn.offsetWidth
      const maxY = window.innerHeight - floatingRoamBtn.offsetHeight
      
      const clampedX = Math.max(0, Math.min(newX, maxX))
      const clampedY = Math.max(0, Math.min(newY, maxY))
      
      floatingRoamBtn.style.left = clampedX + 'px'
      floatingRoamBtn.style.top = clampedY + 'px'
      floatingRoamBtn.style.right = 'auto'
      floatingRoamBtn.style.bottom = 'auto'
    }
  }

  // 拖拽结束
  function endRoamDrag() {
    if (floatingRoamBtn) {
      floatingRoamBtn.style.transition = 'all 0.3s ease'
      
      // 拖拽结束后吸附到边缘
      if (isRoamDragging) {
        const rect = floatingRoamBtn.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const screenWidth = window.innerWidth
        
        // 吸附到左边或右边
        if (centerX < screenWidth / 2) {
          floatingRoamBtn.style.left = '20px'
        } else {
          floatingRoamBtn.style.left = 'auto'
          floatingRoamBtn.style.right = '20px'
        }
        
        // 保存位置
        saveButtonPosition()
      }
    }
    
    isRoamDragging = false
  }

  // 处理漫游按钮点击
  function handleRoamClick(e: Event) {
    if (hasRoamActuallyDragged) {
      e.preventDefault()
      return
    }
    onRoamAction()
  }

  // 保存按钮位置
  function saveButtonPosition() {
    if (floatingRoamBtn) {
      const position = {
        left: floatingRoamBtn.style.left,
        right: floatingRoamBtn.style.right,
        top: floatingRoamBtn.style.top,
        bottom: floatingRoamBtn.style.bottom
      }
      localStorage.setItem('dice-roam-button-position', JSON.stringify(position))
    }
  }

  // 恢复按钮位置
  function restoreButtonPosition() {
    try {
      const savedPosition = localStorage.getItem('dice-roam-button-position')
      if (savedPosition && floatingRoamBtn) {
        const position = JSON.parse(savedPosition)
        if (position.left && position.left !== 'auto') {
          floatingRoamBtn.style.left = position.left
          floatingRoamBtn.style.right = 'auto'
        } else if (position.right && position.right !== 'auto') {
          floatingRoamBtn.style.right = position.right
          floatingRoamBtn.style.left = 'auto'
        }
        
        if (position.top && position.top !== 'auto') {
          floatingRoamBtn.style.top = position.top
          floatingRoamBtn.style.bottom = 'auto'
        } else if (position.bottom && position.bottom !== 'auto') {
          floatingRoamBtn.style.bottom = position.bottom
          floatingRoamBtn.style.top = 'auto'
        }
      }
    } catch (error) {
      pluginInstance.logger.warn('恢复筛子漫游按钮位置失败:', error)
    }
  }

  // 组件挂载后恢复位置
  import { onMount } from 'svelte'
  
  onMount(() => {
    if (floatingRoamBtn) {
      restoreButtonPosition()
    }
  })
</script>

<!-- 筛子漫游按钮 -->
{#if pluginInstance.isMobile}
  <button 
    class="dice-roam-floating-btn" 
    bind:this={floatingRoamBtn}
    on:click={handleRoamClick}
    on:mousedown={startRoamDrag}
    on:mousemove={isRoamDragging ? onRoamDrag : null}
    on:mouseup={endRoamDrag}
    on:touchstart={startRoamDrag}
    on:touchmove={onRoamDrag}
    on:touchend={endRoamDrag}
    disabled={isLoading}
  >
    {#if isLoading}
      ⏳
    {:else}
      🎲
    {/if}
  </button>
{/if}

<style lang="stylus">
  .dice-roam-floating-btn
    position: fixed !important
    bottom: 80px !important
    right: 30px !important
    width: 40px !important
    height: 40px !important
    border-radius: 20px !important
    background-color: var(--b3-theme-primary) !important
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
      background-color: var(--b3-theme-primary-light) !important
      transform: scale(1.05) !important
    
    &:active
      background-color: var(--b3-theme-primary-dark) !important
      transform: scale(0.95) !important
      
    &:disabled
      background-color: #6c757d !important
      cursor: not-allowed !important
      opacity: 0.8 !important
      transform: none !important
</style>

