<!--
  锁定切换按钮组件
  提供编辑区域的锁定/解锁功能
-->

<script lang="ts">
  import { isLocked, toggleLock } from "../../stores/lockStore"
  import type RandomDocPlugin from "../../index"

  // Props
  export let pluginInstance: RandomDocPlugin
</script>

<button 
  class="lock-toggle-btn" 
  on:click={toggleLock} 
  title={$isLocked ? pluginInstance.i18n.unlockEditArea : pluginInstance.i18n.lockEditArea}
>
  {#if $isLocked}
    🔒
  {:else}
    🔓
  {/if}
</button>

<style lang="stylus">
  /* 移动端锁定按钮样式 */
  @media (max-width: 768px) {
    .lock-toggle-btn {
      width: calc(10% - 0.2vw) !important;
      min-height: 4vh !important;
      padding: 0.8vh 0.4vw !important;
      font-size: 3.2vw !important;
      border: 1px solid var(--b3-border-color) !important;
      border-radius: 6px !important;
      background-color: var(--b3-theme-surface) !important;
      color: var(--b3-theme-on-surface) !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }
    
    .lock-toggle-btn:hover {
      background-color: var(--b3-theme-surface-hover);
    }
  }

  /* 桌面端锁定按钮样式 */
  @media (min-width: 769px) {
    .lock-toggle-btn {
      background: none;
      border: 1px solid var(--b3-border-color);
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }
    
    .lock-toggle-btn:hover {
      background-color: var(--b3-theme-surface-light);
      border-color: var(--b3-theme-primary);
    }
  }
</style>
