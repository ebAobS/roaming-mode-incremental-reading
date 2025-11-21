<!--
  - 移动端浮窗：复用桌面侧边栏内容，便于在手机端执行漫游和推荐操作。
-->

<script lang="ts">
  import type RandomDocPlugin from "../index"
  import PluginSidebar from "./PluginSidebar.svelte"

  export let pluginInstance: RandomDocPlugin
  export let onClose: () => void = () => {}

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
    }
  }
</script>

<div
  class="mobile-sidebar-overlay"
  role="dialog"
  aria-modal="true"
  aria-label="漫游式渐进阅读侧边栏浮窗"
  tabindex="0"
  on:click={onClose}
  on:keydown={handleKeydown}
>
  <div class="mobile-sidebar-sheet" on:click|stopPropagation>
    <button class="mobile-sidebar-close" aria-label="关闭浮窗" on:click={onClose}>×</button>
    <div class="mobile-sidebar-body">
      <PluginSidebar {pluginInstance} />
    </div>
  </div>
</div>

<style>
  .mobile-sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 10px;
    z-index: 12000;
  }

  .mobile-sidebar-sheet {
    width: 100%;
    max-width: 980px;
    height: 92vh;
    background: var(--b3-theme-background);
    border-radius: 12px 12px 10px 10px;
    border: 1px solid var(--b3-theme-border);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .mobile-sidebar-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    font-size: 18px;
    cursor: pointer;
    z-index: 1;
  }

  .mobile-sidebar-body {
    flex: 1;
    overflow: hidden;
  }

  /* 嵌入的侧边栏需要填满浮窗 */
  :global(.mobile-sidebar-body > .plugin-sidebar) {
    height: 100%;
  }
</style>
