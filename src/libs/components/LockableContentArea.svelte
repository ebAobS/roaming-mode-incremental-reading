<!--
  可锁定内容区域组件
  提供可编辑/只读切换的内容显示区域
-->

<script lang="ts">
  import { isLocked } from "../../stores/lockStore"
  import type RandomDocPlugin from "../../index"

  // Props
  export let editableContent: string = ""
  export let lockedContent: string = ""
  export let isEditing: boolean = false
  export let onContentEdit: (event: Event) => void = () => {}
  export let onBlur: () => void = () => {}
  export let onFocus: () => void = () => {}
  export let onClick: () => void = () => {}

  // 处理内容编辑
  function handleContentEdit(event: Event) {
    onContentEdit(event)
  }

  // 处理失去焦点
  function handleBlur() {
    isEditing = false
    onBlur()
  }

  // 处理获得焦点
  function handleFocus() {
    isEditing = true
    onFocus()
  }

  // 处理点击
  function handleClick() {
    onClick()
  }
</script>

{#if $isLocked}
  <div class="editable-content-area locked">
    {@html lockedContent}
  </div>
{:else}
  <div 
    class="editable-content-area"
    contenteditable="true"
    spellcheck="false"
    bind:innerHTML={editableContent}
    on:input={handleContentEdit}
    on:blur={handleBlur}
    on:focus={handleFocus}
    on:click={handleClick}
  >
  </div>
{/if}

<style lang="stylus">
  /* 移动端内容区域样式 */
  @media (max-width: 768px) {
    .editable-content-area {
      min-height: 400px;
      padding: 16px;
      border-radius: 6px;
      border: 1px solid var(--b3-border-color);
      margin: 16px 0;
      background-color: var(--b3-theme-background);
      outline: none;
      transition: border-color 0.2s ease;
      
      &.locked {
        background: linear-gradient(135deg, var(--b3-theme-background) 0%, var(--b3-theme-surface-light) 100%);
        color: var(--b3-theme-on-surface);
        cursor: not-allowed;
        border: 2px dashed var(--b3-theme-border);
      }
      
      &:focus:not(.locked) {
        border-color: var(--b3-theme-primary);
        box-shadow: 0 0 0 2px var(--b3-theme-primary-lighter);
      }
      
      &:hover {
        border-color: var(--b3-theme-primary-light);
      }
    }
  }

  /* 桌面端内容区域样式 */
  @media (min-width: 769px) {
    .editable-content-area {
      min-height: 200px;
      padding: 12px;
      background-color: var(--b3-theme-background);
      outline: none;
      transition: all 0.2s ease;
      
      &.locked {
        background: linear-gradient(135deg, var(--b3-theme-background) 0%, var(--b3-theme-surface-light) 100%);
        color: var(--b3-theme-on-surface);
        cursor: not-allowed;
        border: 2px dashed var(--b3-theme-border);
        position: relative;
        
        &::before {
          content: "🔒";
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 16px;
          opacity: 0.4;
          pointer-events: none;
        }
      }
      
      &:focus:not(.locked) {
        box-shadow: inset 0 0 0 1px var(--b3-theme-primary);
      }
    }
  }
</style>
