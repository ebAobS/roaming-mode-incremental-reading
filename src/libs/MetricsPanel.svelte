<!--
  - Copyright (c) 2025, ebAobS . All rights reserved.
  - DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
  -
  - This code is free software; you can redistribute it and/or modify it
  - under the terms of the GNU General Public License version 2 only, as
  - published by the Free Software Foundation.  ebAobS designates this
  - particular file as subject to the "Classpath" exception as provided
  - by ebAobS in the LICENSE file that accompanied this code.
  -
  - This code is distributed in the hope that it will be useful, but WITHOUT
  - ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
  - FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
  - version 2 for more details (a copy is included in the LICENSE file that
  - accompanied this code).
  -
  - You should have received a copy of the GNU General Public License version
  - 2 along with this work; if not, write to the Free Software Foundation,
  - Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
  -
  - Please contact ebAobS, ebAobs@outlook.com
  - or visit https://github.com/ebAobS/roaming-mode-incremental-reading if you need additional information or have any
  - questions.
  -->

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import RandomDocPlugin from "../index"
  import IncrementalReviewer from "../service/IncrementalReviewer"
  import type { Metric } from "../models/IncrementalConfig"

  // props
  export let pluginInstance: RandomDocPlugin
  export let docId: string = ""
  export let reviewer: IncrementalReviewer
  export let metrics: Metric[] = []
  export let totalPriority: number = 0
  export let docPriority: { [key: string]: number } = {}

  // state
  let docMetrics: Map<string, number> = new Map()
  let priorityColor: string = "#666"
  let isLoading = true
  let errorMessage: string = ""
  let roamingCount: number = 0
  let roamingLastTime: string = ""
  let editingPriority: boolean = false
  let priorityInputValue: string = ""

  function setPriorityInput(val: number) {
    priorityInputValue = val.toFixed(2)
  }

  function increasePriority() {
    let v = parseFloat(priorityInputValue)
    if (isNaN(v)) v = totalPriority
    v = Math.min(10, v + 1)
    setPriorityInput(v)
    handlePriorityInput()
  }
  function decreasePriority() {
    let v = parseFloat(priorityInputValue)
    if (isNaN(v)) v = totalPriority
    v = Math.max(0, v - 1)
    setPriorityInput(v)
    handlePriorityInput()
  }

  // 处理输入步进，修复小数点问题
  function handleInputStep(e: Event) {
    const input = e.target as HTMLInputElement
    const value = parseFloat(input.value)
    if (!isNaN(value)) {
      // 确保保留两位小数
      input.value = value.toFixed(2)
    }
  }

  // 初始化优先级输入框
  $: if (!isLoading && !editingPriority) {
    setPriorityInput(totalPriority)
  }

  // events
  const dispatch = createEventDispatcher()

  // 初始化
  onMount(async () => {
    try {
      await loadDocMetrics()
    } catch (err) {
      errorMessage = `加载指标数据失败: ${err.message}`
      pluginInstance.logger.error(errorMessage, err)
    }
  })

  // 当文档ID变化时重新加载
  $: if (docId) {
    // 重置数据，防止显示上一篇文章的数据
    docMetrics = new Map()
    errorMessage = ""
    isLoading = true
    
    // 使用setTimeout确保在渲染循环中异步执行，避免状态混淆
    setTimeout(() => loadDocMetrics(), 0)
  }

  // 监听外部 docPriority 变化，实时同步到内部状态
  $: if (docPriority && Object.keys(docPriority).length > 0 && !isLoading) {
    // 更新内部 docMetrics 数据
    let newDocMetrics = new Map()
    metrics.forEach(metric => {
      const value = docPriority[metric.id] !== undefined 
        ? docPriority[metric.id] 
        : 5.0
      newDocMetrics.set(metric.id, value)
    })
    docMetrics = newDocMetrics
    
    // 重新计算优先级并更新输入框
    calculatePriority()
  }

  // 加载文档指标数据
  async function loadDocMetrics() {
    if (!docId || !reviewer) {
      errorMessage = "缺少文档ID或审阅器实例"
      isLoading = false
      return
    }
    
    const currentDocId = docId // 保存当前处理的文档ID，用于后续校验
    
    errorMessage = ""
    isLoading = true
    
    try {
      pluginInstance.logger.info(`开始加载文档 ${currentDocId} 的指标数据`)
      
      // 如果metrics数组为空，尝试从reviewer获取
      if (!metrics || metrics.length === 0) {
        try {
          metrics = reviewer.getMetrics()
          if (!metrics || metrics.length === 0) {
            errorMessage = "无法获取文档指标配置"
            pluginInstance.logger.error(errorMessage)
            isLoading = false
            return
          }
        } catch (error) {
          errorMessage = `获取指标配置失败: ${error.message}`
          pluginInstance.logger.error(errorMessage, error)
          isLoading = false
          return
        }
      }
      
      // 创建新的Map实例，确保不使用之前的数据
      let newDocMetrics = new Map()
      
      // 如果外部传入了docPriority，直接使用，否则从reviewer获取
      if (Object.keys(docPriority).length > 0) {
        // 更新指标值
        metrics.forEach(metric => {
          const value = docPriority[metric.id] !== undefined 
            ? docPriority[metric.id] 
            : 5.0
          newDocMetrics.set(metric.id, value)
        })
        
        // 检查文档ID是否仍然匹配(异步操作可能导致文档ID已经改变)
        if (currentDocId !== docId) {
          pluginInstance.logger.warn(`文档ID已改变，放弃处理 ${currentDocId} 的数据`)
          return
        }
        
        // 更新状态
        docMetrics = newDocMetrics
      } else {
        // 从reviewer获取数据
        const docPriorityData = await reviewer.getDocPriorityData(currentDocId)
        
        // 再次检查文档ID是否仍然匹配
        if (currentDocId !== docId) {
          pluginInstance.logger.warn(`文档ID已改变，放弃处理 ${currentDocId} 的数据`)
          return
        }
        
        // 更新指标值
        metrics.forEach(metric => {
          const value = docPriorityData.metrics[metric.id] !== undefined 
            ? docPriorityData.metrics[metric.id] 
            : 5.0
          newDocMetrics.set(metric.id, value)
        })
        
        // 更新状态
        docMetrics = newDocMetrics
      }
      
      pluginInstance.logger.info(`文档 ${currentDocId} 的指标数据加载完成`)
      
      // 获取漫游次数
      try {
        roamingCount = await reviewer.getRoamingCount(currentDocId)
      } catch (error) {
        pluginInstance.logger.error(`获取文档 ${currentDocId} 的漫游次数失败:`, error)
        roamingCount = 0
      }
      // 获取上次访问时间
      try {
        const last = await reviewer.getRoamingLastTime(currentDocId)
        if (last) {
          // 格式化为 YYYY-MM-DD HH:mm
          const d = new Date(last)
          const y = d.getFullYear()
          const m = (d.getMonth() + 1).toString().padStart(2, '0')
          const day = d.getDate().toString().padStart(2, '0')
          const h = d.getHours().toString().padStart(2, '0')
          const min = d.getMinutes().toString().padStart(2, '0')
          roamingLastTime = `${y}-${m}-${day} ${h}:${min}`
        } else {
          roamingLastTime = "-"
        }
      } catch (error) {
        pluginInstance.logger.error(`获取文档 ${currentDocId} 的上次访问时间失败:`, error)
        roamingLastTime = "-"
      }
      
      // 计算优先级并设置颜色
      calculatePriority()
    } catch (error) {
      // 确保错误处理也检查文档ID
      if (currentDocId !== docId) {
        return
      }
      
      errorMessage = `加载指标数据失败: ${error.message}`
      pluginInstance.logger.error(`加载文档 ${currentDocId} 指标数据失败:`, error)
    } finally {
      // 确保最终状态更新也检查文档ID
      if (currentDocId === docId) {
        isLoading = false
      }
    }
  }

  // 计算总体优先级
  function calculatePriority() {
    let weightedSum = 0
    let totalWeight = 0
    
    metrics.forEach(metric => {
      const value = docMetrics.get(metric.id) || 0
      weightedSum += value * metric.weight
      totalWeight += metric.weight
    })
    
    totalPriority = totalWeight > 0 ? weightedSum / totalWeight : 0
    
    // 设置优先级颜色 (从绿色到红色的渐变)
    const hue = (120 - totalPriority * 12) // 120为绿色, 0为红色
    priorityColor = `hsl(${hue}, 80%, 45%)`
    
    // 同步更新优先级输入框的值
    if (!editingPriority) {
      setPriorityInput(totalPriority)
    }
    
    // 通知父组件优先级已更新
    dispatch("priorityChange", { priority: totalPriority })
  }

  // 直接更新指标值 (供输入框使用)
  async function updateMetricValue(metricId: string, newValueStr: string) {
    let newValue = parseFloat(newValueStr)
    
    // 验证输入是否为有效数字
    if (isNaN(newValue)) {
      // 如果输入无效，恢复原来的值
      newValue = docMetrics.get(metricId) || 0
      return
    }
    
    // 限制在0-10范围内
    newValue = Math.max(0, Math.min(10, newValue))
    
    // 更新本地状态
    docMetrics.set(metricId, newValue)
    docMetrics = new Map(docMetrics) // 使用新Map实例触发Svelte更新界面
    
    // 重新计算优先级
    calculatePriority()
    
    // 保存到文档
    try {
      await reviewer.updateDocMetric(docId, metricId, newValue)
    } catch (error) {
      errorMessage = `更新指标失败: ${error.message}`
      pluginInstance.logger.error(errorMessage, error)
    }
  }

  // 增加指标值
  async function increaseMetric(metricId: string) {
    const currentValue = docMetrics.get(metricId) || 0
    const newValue = Math.min(10, currentValue + 1)
    
    // 更新本地状态
    docMetrics.set(metricId, newValue)
    docMetrics = new Map(docMetrics) // 使用新Map实例触发Svelte更新界面
    
    // 重新计算优先级
    calculatePriority()
    
    // 保存到文档
    try {
      await reviewer.updateDocMetric(docId, metricId, newValue)
    } catch (error) {
      errorMessage = `增加指标值失败: ${error.message}`
      pluginInstance.logger.error(errorMessage, error)
    }
  }

  // 减少指标值
  async function decreaseMetric(metricId: string) {
    const currentValue = docMetrics.get(metricId) || 0
    const newValue = Math.max(0, currentValue - 1)
    
    // 更新本地状态
    docMetrics.set(metricId, newValue)
    docMetrics = new Map(docMetrics) // 使用新Map实例触发Svelte更新界面
    
    // 重新计算优先级
    calculatePriority()
    
    // 保存到文档
    try {
      await reviewer.updateDocMetric(docId, metricId, newValue)
    } catch (error) {
      errorMessage = `减少指标值失败: ${error.message}`
      pluginInstance.logger.error(errorMessage, error)
    }
  }



  async function handlePriorityInput() {
    let newValue = parseFloat(priorityInputValue)
    if (isNaN(newValue)) {
      setPriorityInput(totalPriority)
      return
    }
    newValue = Math.max(0, Math.min(10, newValue))
    const oldPriority = totalPriority
    if (oldPriority === 0) {
      // 全部设为新优先级/权重和
      let totalWeight = 0
      metrics.forEach(m => totalWeight += m.weight)
      metrics.forEach(metric => {
        const v = totalWeight > 0 ? newValue * (metric.weight / totalWeight) : 0
        docMetrics.set(metric.id, v)
      })
    } else {
      const ratio = newValue / oldPriority
      metrics.forEach(metric => {
        const oldVal = docMetrics.get(metric.id) || 0
        let v = oldVal * ratio
        v = Math.max(0, Math.min(10, v))
        docMetrics.set(metric.id, v)
      })
    }
    docMetrics = new Map(docMetrics) // 使用新Map实例触发Svelte更新界面
    calculatePriority()
    // 保存到文档
    for (const metric of metrics) {
      try {
        await reviewer.updateDocMetric(docId, metric.id, docMetrics.get(metric.id) || 0)
      } catch (e) {}
    }
    setPriorityInput(totalPriority)
  }
</script>

<div class="metrics-panel">
  <div class="metrics-title">
    <h3>文档指标</h3>
    <div class="priority-edit-row">
      <span class="priority-label">优先级</span>
      <div class="priority-edit-group">
        <button class="priority-btn" on:click={decreasePriority}>-</button>
        <input id="priority-input" type="number" min="0" max="10" step="0.01"
          bind:value={priorityInputValue}
          on:blur={handlePriorityInput}
          on:keydown={(e) => e.key === 'Enter' && handlePriorityInput()}
          on:input={handleInputStep}
          class="priority-input"
        />
        <button class="priority-btn" on:click={increasePriority}>+</button>
      </div>
    </div>
  </div>
  
  {#if isLoading}
    <div class="loading-message">
      正在加载指标数据...
    </div>
  {:else if errorMessage}
    <div class="error-message">
      {errorMessage}
    </div>
  {:else if !metrics || metrics.length === 0}
    <div class="no-metrics-message">
      未找到指标配置，请在设置中添加指标
    </div>
  {:else}
    <div class="metrics-list">
      {#each metrics as metric}
        <div class="metric-item">
          <div class="metric-name" title={metric.description || ""}>
            {metric.name}<span class="metric-weight">({metric.weight.toFixed(0)}%)</span>
          </div>
          <div class="metric-controls">
            <button on:click={() => decreaseMetric(metric.id)}>-</button>
            <input 
              type="number" 
              min="0" 
              max="10" 
              step="0.01"
              class="metric-value" 
              value={docMetrics.get(metric.id)?.toFixed(2) || "0.00"}
              on:blur={(e) => updateMetricValue(metric.id, e.currentTarget.value)}
              on:input={handleInputStep}
              on:keydown={(e) => e.key === 'Enter' && updateMetricValue(metric.id, e.currentTarget.value)}
              style="background: linear-gradient(to right, var(--b3-theme-primary-light) {docMetrics.get(metric.id) * 10}%, transparent 0%);"
            />
            <button on:click={() => increaseMetric(metric.id)}>+</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  
  <!-- 漫游次数显示 -->
  {#if !isLoading && !errorMessage}
    <div class="roaming-count-section">
      <div class="roaming-count">
        漫游次数：{roamingCount}
      </div>
      <div class="roaming-last">
        上次访问：{roamingLastTime}
      </div>
    </div>
  {/if}
</div>

<style>
  .metrics-panel {
    margin-top: 8px;
    padding: 6px 8px;
    border: 1px solid var(--b3-border-color);
    border-radius: 4px;
    background-color: var(--b3-theme-background);
    font-size: 13px;
    box-shadow: var(--b3-dialog-shadow);
  }
  
  .metrics-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    border-bottom: 1px solid var(--b3-border-color);
    padding-bottom: 4px;
  }
  .priority-edit-row {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
    gap: 8px;
  }
  .priority-label {
    font-size: 13px;
    color: var(--b3-theme-on-surface);
    font-weight: 500;
    margin-right: 4px;
  }
  .priority-edit-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .priority-btn {
    /* 完全复用.metric-controls button的尺寸和样式，仅主色区别 */
    width: 24px;
    height: 24px;
    border-radius: 3px;
    border: 1px solid var(--b3-theme-primary); /* 主色 */
    background-color: var(--b3-theme-background);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    color: var(--b3-theme-primary); /* 主色 */
    font-weight: bold;
    transition: background 0.2s;
  }
  .priority-btn:hover {
    background: var(--b3-theme-primary-light);
  }
  .priority-input {
    /* 完全复用.metric-value的尺寸和样式，仅主色区别 */
    width: 40px;
    text-align: center;
    margin: 0 4px;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid var(--b3-theme-primary); /* 主色 */
    font-weight: bold;
    font-size: 13px;
    background-color: var(--b3-theme-surface);
    color: var(--b3-theme-primary); /* 主色 */
  }
  
  .metrics-title h3 {
    margin: 0;
    font-size: 14px;
    color: var(--b3-theme-on-surface);
  }
  

  
  .priority-display {
    font-weight: bold;
    font-size: 14px;
  }
  
  .roaming-count-section {
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid var(--b3-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .roaming-count {
    font-size: 12px;
    color: var(--b3-theme-on-surface-light);
    font-weight: normal;
  }
  
  .roaming-last {
    font-size: 12px;
    color: var(--b3-theme-on-surface-light);
    font-weight: normal;
  }
  
  .metrics-list {
    margin-bottom: 8px;
  }
  
  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    padding: 2px 0;
  }
  
  .metric-name {
    flex: 1;
    font-weight: 500;
    font-size: 13px;
    color: var(--b3-theme-on-surface);
  }
  
  .metric-weight {
    color: var(--b3-theme-on-surface-light);
    font-size: 0.85em;
    font-weight: normal;
    margin-left: 4px;
  }
  
  .metric-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .metric-controls button {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    border: 1px solid var(--b3-border-color);
    background-color: var(--b3-theme-background);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    color: var(--b3-theme-on-surface);
  }
  
  .metric-controls button:hover {
    background-color: var(--b3-list-hover);
  }
  
  .metric-value {
    width: 40px;
    text-align: center;
    margin: 0 4px;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid var(--b3-border-color);
    font-weight: bold;
    font-size: 13px;
    background-color: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
  }
  
  .no-metrics-message {
    padding: 10px;
    text-align: center;
    color: var(--b3-theme-on-surface-light);
    font-style: italic;
    font-size: 13px;
    border: 1px dashed var(--b3-border-color);
    border-radius: 4px;
    margin: 8px 0;
    background-color: var(--b3-theme-surface);
  }
  
  .loading-message {
    padding: 10px;
    text-align: center;
    color: var(--b3-theme-primary);
    font-style: italic;
    font-size: 13px;
    border: 1px solid var(--b3-theme-primary-lighter);
    border-radius: 4px;
    margin: 8px 0;
    background-color: var(--b3-theme-primary-lightest);
  }
  
  .error-message {
    padding: 10px;
    text-align: center;
    color: var(--b3-theme-error);
    font-style: italic;
    font-size: 13px;
    border: 1px solid var(--b3-theme-error-lighter);
    border-radius: 4px;
    margin: 8px 0;
    background-color: var(--b3-theme-error-lightest);
  }

  .priority-edit-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
  }
  .priority-btn {
    /* 完全复用.metric-controls button的尺寸和样式，仅主色区别 */
    width: 24px;
    height: 24px;
    border-radius: 3px;
    border: 1px solid var(--b3-theme-primary); /* 主色 */
    background-color: var(--b3-theme-background);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    color: var(--b3-theme-primary); /* 主色 */
    font-weight: bold;
    transition: background 0.2s;
  }
  .priority-btn:hover {
    background: var(--b3-theme-primary-light);
  }
  .priority-input {
    /* 完全复用.metric-value的尺寸和样式，仅主色区别 */
    width: 40px;
    text-align: center;
    margin: 0 4px;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid var(--b3-theme-primary); /* 主色 */
    font-weight: bold;
    font-size: 13px;
    background-color: var(--b3-theme-surface);
    color: var(--b3-theme-primary); /* 主色 */
  }
  .priority-label {
    font-size: 13px;
    color: var(--b3-theme-primary);
    font-weight: bold;
    margin-top: 2px;
    margin-left: 2px;
  }
</style> 