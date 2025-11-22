<script lang="ts">
  import RandomDocPlugin from "../index"
  import { onMount } from "svelte"
  import RandomDocConfig from "../models/RandomDocConfig"
  import { storeName } from "../Constants"
  import { showMessage, Dialog } from "siyuan"
  import IncrementalReviewer from "../service/IncrementalReviewer"
  import type { Metric } from "../models/IncrementalConfig"
  import { isLocked, toggleLock } from "../stores/lockStore"

  // props
  export let pluginInstance: RandomDocPlugin
  export let dialog

  let storeConfig: RandomDocConfig
  let reviewMode: any = "incremental"
  let excludeVisited = true
  let autoResetOnStartup = false
  let autoReloadWhenEmpty = false
  let absolutePriorityProb = 0;
  let enableDebugLog = false;
  
  // 渐进模式配置相关
  let reviewer: IncrementalReviewer
  let metrics: Metric[] = []
  let newMetric: Partial<Metric> = { id: "", name: "", weight: 10, value: 5, description: "" }

  // 进度状态
  let isProcessing = false
  let processProgress = 0
  let processTotal = 0
  let processCurrent = 0
  
  // 批量随机重置文档优先级相关变量
  let batchResetCurrentMin = 0;
  let batchResetCurrentMax = 10;
  let batchResetNewMin = 5;
  let batchResetNewMax = 10;
  let isProcessingBatchReset = false;
  let batchResetProgress = 0;
  let batchResetTotal = 0;
  let batchResetCurrent = 0;
  
  // 清空所有文档数据相关变量
  let isProcessingClearData = false;
  let clearDataProgress = 0;
  let clearDataTotal = 0;
  let clearDataCurrent = 0;

  let activeTab = 0;
  const tabList = ["基本配置", "文档指标配置", "批量优先级重置", "智能推荐设置"];

  // 推荐配置
  let recommendRecentCount = 3
  let recommendTopCount = 2
  let recommendTopK = 8
  let recommendMaxCandidates = 120
  let recommendMaxParagraphs = 8

  const onSaveSetting = async () => {
    try {
      storeConfig.reviewMode = reviewMode
      storeConfig.excludeVisited = excludeVisited
      storeConfig.autoResetOnStartup = autoResetOnStartup
      storeConfig.autoReloadWhenEmpty = autoReloadWhenEmpty
      storeConfig.absolutePriorityProb = Math.max(0, Math.min(1, Number(absolutePriorityProb)))
      storeConfig.enableDebugLog = enableDebugLog
      storeConfig.recentAnchorCount = Number(recommendRecentCount) || 1
      storeConfig.topAnchorCount = Number(recommendTopCount) || 1
      storeConfig.recommendTopK = Number(recommendTopK) || 3
      storeConfig.recommendMaxCandidates = Number(recommendMaxCandidates) || 50
      storeConfig.recommendMaxParagraphs = Number(recommendMaxParagraphs) || 8
      await pluginInstance.saveData(storeName, storeConfig)
      pluginInstance.setDebugLogEnabled(enableDebugLog)
      
      // 保存渐进配置
      if (reviewer) {
        await reviewer.saveIncrementalConfig()
        
        // 只有在文档指标配置栏(activeTab === 1)才执行文档指标修复
        if (activeTab === 1) {
          // 开始处理文档，显示进度条
          isProcessing = true
          processProgress = 0
          processCurrent = 0
          processTotal = 0
          
          // 查找所有指标值为0的文档，将它们改为默认值5
          const repairResult = await reviewer.repairAllDocumentMetrics((current, total) => {
            processCurrent = current
            processTotal = total
            processProgress = Math.floor((current / total) * 100)
          })
          
          // 重置进度状态
          isProcessing = false
          
          // 格式化统计信息
          const stats = []
          if (repairResult.updatedDocs > 0) {
            // 添加修复的指标信息
            if (repairResult.updatedMetrics.length > 0) {
              const updatedMetricsSummary = repairResult.updatedMetrics
                .filter(m => m.count > 0)
                .map(m => `"${m.name}"(${m.count}篇)`)
                .join("、")
              stats.push(`修复了${repairResult.updatedMetrics.reduce((sum, m) => sum + m.count, 0)}个指标值(${updatedMetricsSummary})`)
            }
          
            // 添加删除的指标信息
            if (repairResult.deletedMetricsCount > 0) {
              stats.push(`删除了${repairResult.deletedMetricsCount}个无效指标`)
            }
            
            // 添加优先级计算信息
            if (repairResult.updatedPriorities > 0) {
              stats.push(`重新计算了${repairResult.updatedPriorities}个文档的优先级`)
            }
            
            // 显示总结信息
            const statsSummary = stats.join("，")
            pluginInstance.logger.info(`已处理${repairResult.totalDocs}篇文档，${repairResult.updatedDocs}篇被更新。${statsSummary}`)
            showMessage(`已处理${repairResult.totalDocs}篇文档，${repairResult.updatedDocs}篇被更新。${statsSummary}`, 7000)
          } else {
            showMessage(`已处理${repairResult.totalDocs}篇文档，所有文档指标都已正确设置`, 3000)
          }
        }
      }

      if (!isProcessing) {
        showMessage(`${pluginInstance.i18n.settingConfigSaveSuccess}`, 2000, "info")
        dialog.destroy()
      }
    } catch (error) {
      // 发生错误时也要重置进度状态
      isProcessing = false
      showMessage("保存配置失败: " + error.message, 5000, "error")
    }
  }

  // 添加新指标
  async function addMetric() {
    // 验证输入
    if (!newMetric.id || !newMetric.name) {
      showMessage("ID和名称不能为空", 3000, "error")
      return
    }
    
    if (metrics.some(m => m.id === newMetric.id)) {
      showMessage("ID已存在", 3000, "error")
      return
    }
    
    // 创建完整的指标对象
    const metric: Metric = {
      id: newMetric.id,
      name: newMetric.name,
      value: newMetric.value || 5,
      weight: newMetric.weight || 10,
      description: newMetric.description || ""
    }
    
    // 添加指标
    await reviewer.addMetric(metric)
    
    // 更新指标列表
    metrics = reviewer.getMetrics()
    
    // 重置表单
    newMetric = { id: "", name: "", weight: 10, value: 5, description: "" }
    
    showMessage("指标已添加", 2000)
  }

  // 删除指标
  async function removeMetric(metricId: string) {
    // 至少保留一个指标
    if (metrics.length <= 1) {
      showMessage("至少需要保留一个指标", 3000, "error")
      return
    }
    
    // 删除指标
    await reviewer.removeMetric(metricId)
    
    // 更新指标列表
    metrics = reviewer.getMetrics()
    
    showMessage("指标已删除", 2000)
  }

  // 更新指标权重
  async function updateMetricWeight(metricId: string, newWeight: number) {
    // 确保权重为正数
    newWeight = Math.max(1, newWeight)
    
    // 更新指标
    await reviewer.updateMetric(metricId, { weight: newWeight })
    
    // 更新指标列表
    metrics = reviewer.getMetrics()
  }

  // 批量随机重置文档优先级
  async function batchRandomResetPriority() {
    try {
      // 输入验证
      if (batchResetCurrentMin > batchResetCurrentMax) {
        showMessage("当前优先级下限不能大于上限", 3000, "error");
        return;
      }
      if (batchResetNewMin > batchResetNewMax) {
        showMessage("重置后优先级下限不能大于上限", 3000, "error");
        return;
      }
      
      // 设置处理状态
      isProcessingBatchReset = true;
      batchResetProgress = 0;
      batchResetCurrent = 0;
      batchResetTotal = 0;
      
      // 构建过滤条件
      const filterCondition = reviewer.buildFilterCondition(storeConfig);
      
      // 构建SQL查询，找出所有在指定优先级范围内的文档
      const metricIds = metrics.map(m => m.id);
      let metricConditions = [];
      
      // 为每个指标创建条件：在指定优先级范围内的文档
      for (const metricId of metricIds) {
        const metricCondition = `
          (
            EXISTS (
              SELECT 1 FROM attributes 
              WHERE block_id = blocks.id 
              AND name = 'custom-metric-${metricId}'
              AND CAST(value AS REAL) >= ${batchResetCurrentMin}
              AND CAST(value AS REAL) <= ${batchResetCurrentMax}
            )
          )
        `;
        metricConditions.push(metricCondition);
      }
      
      // 组合所有条件，任一指标满足条件即可
      const priorityCondition = metricConditions.length > 0 
        ? `AND (${metricConditions.join(" OR ")})` 
        : "";
      
      // 构建完整的查询语句
      const countSql = `
        SELECT COUNT(id) as total FROM blocks 
        WHERE type = 'd' 
        ${filterCondition}
        ${priorityCondition}
      `;
      
      // 执行查询，统计符合条件的文档数量
      const countResult = await pluginInstance.kernelApi.sql(countSql);
      if (countResult.code !== 0) {
        throw new Error(countResult.msg);
      }
      
      batchResetTotal = countResult.data?.[0]?.total || 0;
      
      // 检查是否有符合条件的文档
      if (batchResetTotal === 0) {
        isProcessingBatchReset = false;
        showMessage("没有找到符合当前优先级范围的文档", 5000, "info");
        return;
      }
      
      // 分页获取所有符合条件的文档
      const pageSize = 50;
      let allDocs = [];
      
      for (let offset = 0; offset < batchResetTotal; offset += pageSize) {
        const pageSql = `
          SELECT id FROM blocks 
          WHERE type = 'd' 
          ${filterCondition}
          ${priorityCondition}
          LIMIT ${pageSize} OFFSET ${offset}
        `;
        
        const pageResult = await pluginInstance.kernelApi.sql(pageSql);
        if (pageResult.code !== 0) {
          throw new Error(pageResult.msg);
        }
        
        const pageDocs = pageResult.data as any[] || [];
        allDocs = allDocs.concat(pageDocs);
        
        batchResetProgress = Math.floor((allDocs.length / batchResetTotal) * 40); // 前40%进度用于收集文档
      }
      
      // 处理每个文档，随机设置新的优先级
      for (let i = 0; i < allDocs.length; i++) {
        const doc = allDocs[i];
        batchResetCurrent = i + 1;
        
        // 计算处理进度 (40%~100%)
        batchResetProgress = Math.floor(40 + (i / allDocs.length) * 60);
        
        // 为每个指标生成一个新的随机优先级值
        const updatedMetrics = {};
        for (const metric of metrics) {
          // 生成随机值，保留两位小数
          const randomValue = (Math.random() * (batchResetNewMax - batchResetNewMin) + batchResetNewMin).toFixed(2);
          updatedMetrics[`custom-metric-${metric.id}`] = randomValue;
        }
        
        // 更新文档指标
        await pluginInstance.kernelApi.setBlockAttrs(doc.id, updatedMetrics);
        
        // 每处理20个文档显示一次进度
        if (i % 20 === 0 || i === allDocs.length - 1) {
          showMessage(`正在重置文档优先级: ${i+1}/${allDocs.length}`, 800, "info");
        }
      }
      
      // 处理完成
      isProcessingBatchReset = false;
      showMessage(`成功重置 ${allDocs.length} 篇文档的优先级`, 5000, "info");
      
    } catch (error) {
      isProcessingBatchReset = false;
      pluginInstance.logger.error("批量重置文档优先级失败", error);
      showMessage(`批量重置文档优先级失败: ${error.message}`, 5000, "error");
    }
  }

  // 清空所有文档指标和优先级数据
  async function clearAllDocumentData() {
    try {
      // 显示警告确认对话框
      const warningMessage = `⚠️ 此操作不可逆！

此操作将删除所有文档的以下属性：
• 文档优先级 (custom-priority)
• 所有文档指标 (custom-metric-*)
• 漫游次数记录 (custom-roaming-count)
• 漫游时间记录 (custom-roaming-last)
• 访问次数记录 (custom-visit-count)

完全卸载本插件前使用这个功能，删除文档优先级、文档指标、漫游记录和访问记录属性数据。
好的插件，不乱拉屎(≖ᴗ≖๑)

确定要继续吗？`

      const confirmed = window.confirm(warningMessage)

      if (!confirmed) {
        return
      }

      // 设置处理状态
      isProcessingClearData = true
      clearDataProgress = 0
      clearDataCurrent = 0
      clearDataTotal = 0

      // 调用IncrementalReviewer的清空方法
      const clearResult = await reviewer.clearAllDocumentData((current, total) => {
        clearDataCurrent = current
        clearDataTotal = total
        clearDataProgress = Math.floor((current / total) * 100)
      })

      // 处理完成
      isProcessingClearData = false
      
      // 显示完成信息
      showMessage(`已清空 ${clearResult.clearedDocs} 篇文档的指标和优先级数据`, 5000, "info")
      
      // 自动关闭设置页面
      setTimeout(() => {
        dialog.destroy()
      }, 2000)

    } catch (error) {
      isProcessingClearData = false
      pluginInstance.logger.error("清空所有文档数据失败", error)
      showMessage(`清空数据失败: ${error.message}`, 5000, "error")
    }
  }

  const onCancel = async () => {
    dialog.destroy()
  }
  
  // 初始化渐进模式配置
  async function initIncrementalConfig() {
    reviewer = new IncrementalReviewer(storeConfig, pluginInstance)
    await reviewer.initIncrementalConfig()
    metrics = reviewer.getMetrics()
  }

  onMount(async () => {
    storeConfig = await pluginInstance.loadData(storeName)
    reviewMode = storeConfig?.reviewMode ?? "incremental"
    excludeVisited = storeConfig?.excludeVisited !== false
    autoResetOnStartup = storeConfig?.autoResetOnStartup ?? false
    autoReloadWhenEmpty = storeConfig?.autoReloadWhenEmpty ?? false
    absolutePriorityProb = typeof storeConfig?.absolutePriorityProb === 'number' ? storeConfig.absolutePriorityProb : 0;
    enableDebugLog = storeConfig?.enableDebugLog ?? false;
    recommendRecentCount = storeConfig?.recentAnchorCount ?? 3
    recommendTopCount = storeConfig?.topAnchorCount ?? 2
    recommendTopK = storeConfig?.recommendTopK ?? 8
    recommendMaxCandidates = storeConfig?.recommendMaxCandidates ?? 120
    recommendMaxParagraphs = storeConfig?.recommendMaxParagraphs ?? 8
      
    // 如果当前是渐进模式，初始化渐进配置
    if (reviewMode === "incremental") {
      await initIncrementalConfig()
    }
  })
</script>

<div class="random-doc-setting">
  <div class="config__tab-header">
    <div class="tab-items">
      {#each tabList as tab, idx}
        <div class="tab-item {activeTab === idx ? 'active' : ''}" on:click={() => activeTab = idx}>{tab}</div>
      {/each}
    </div>
    <button class="lock-btn" on:click={toggleLock} title={$isLocked ? pluginInstance.i18n.unlockEditArea : pluginInstance.i18n.lockEditArea}>
      {#if $isLocked}
        🔒
      {:else}
        🔓
      {/if}
    </button>
  </div>
  <div class="config__tab-container">
    {#if activeTab === 0}
      <!-- 基本配置页内容 -->
      <div class="fn__block form-item incremental-config-section">
        <div class="config-section">
          <div class="form-row">
            <div class="form-group">
              <div class="label-input-row">
                <h4 class="setting-title">绝对优先级顺序漫游概率</h4>
                <input
                  class="b3-text-field right-align-input"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  bind:value={absolutePriorityProb}
                  on:input={() => {
                    if (String(absolutePriorityProb) === '' || isNaN(Number(absolutePriorityProb))) absolutePriorityProb = 0;
                    else absolutePriorityProb = Math.max(0, Math.min(1, Number(absolutePriorityProb)));
                  }}
                  disabled={$isLocked}
                  readonly={$isLocked}
                />
              </div>
              <p class="help-text">设置为0则禁用，设置为0.2表示20%的概率直接漫游优先级最高的未访问文档。范围0~1。</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <h4 class="setting-title">自动重置访问记录</h4>
              <label>
                <input
                  type="checkbox"
                  bind:checked={autoResetOnStartup}
                  disabled={$isLocked}
                />
                开启后，每次启动自动清空已访问文档记录
              </label>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <h4 class="setting-title">自动重载漫游</h4>
              <label>
                <input
                  type="checkbox"
                  bind:checked={autoReloadWhenEmpty}
                  disabled={$isLocked}
                />
                开启后，当没有可用文档时自动清除访问记录并重新开始
              </label>
              <p class="help-text">仅在开启"排除已访问文档"时生效</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <h4 class="setting-title">{pluginInstance.i18n.enableDebugLog}</h4>
              <label>
                <input
                  type="checkbox"
                  bind:checked={enableDebugLog}
                  disabled={$isLocked}
                />
                {pluginInstance.i18n.enableDebugLogTip}
              </label>
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if activeTab === 1}
      <!-- 文档指标配置页内容 -->
      <div class="fn__block form-item incremental-config-section">
        {#if metrics && metrics.length > 0}
          <div class="config-section">
            <h4>已有指标</h4>
            <p class="help-text">权重总和将自动调整为100%</p>
            <div class="table-container">
              <table class="metrics-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>名称</th>
                    <th>权重 (%)</th>
                    <th>描述</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {#each metrics as metric}
                    <tr>
                      <td>{metric.id}</td>
                      <td>{metric.name}</td>
                      <td>
                        <input 
                          type="number" 
                          value={metric.weight.toFixed(0)} 
                          min="1" 
                          on:change={(e) => updateMetricWeight(metric.id, parseFloat(e.currentTarget.value))}
                        />
                      </td>
                      <td>{metric.description || "-"}</td>
                      <td>
                        <button class="delete-button" on:click={() => removeMetric(metric.id)}>删除</button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
          <div class="config-section compact-section">
            <h4>添加新指标</h4>
            <div class="form-row">
              <div class="form-group small-group">
                <label for="newMetricId">ID</label>
                <input 
                  type="text" 
                  id="newMetricId" 
                  bind:value={newMetric.id} 
                  placeholder="ID"
                />
              </div>
              <div class="form-group small-group">
                <label for="newMetricName">名称</label>
                <input 
                  type="text" 
                  id="newMetricName" 
                  bind:value={newMetric.name} 
                  placeholder="名称"
                />
              </div>
              <div class="form-group tiny-group">
                <label for="newMetricWeight">权重</label>
                <input 
                  type="number" 
                  id="newMetricWeight" 
                  bind:value={newMetric.weight} 
                  min="1" 
                  max="100"
                />
              </div>
              <div class="form-group">
                <label for="newMetricDescription">描述 (可选)</label>
                <input 
                  type="text" 
                  id="newMetricDescription" 
                  bind:value={newMetric.description} 
                  placeholder="简短描述"
                />
              </div>
              <div class="form-group button-group">
                <button class="add-button" on:click={addMetric}>添加</button>
              </div>
            </div>
          </div>
        {/if}
        {#if isProcessing}
          <div class="fn__block form-item progress-section">
            <h3>正在修复文档指标</h3>
            <div class="progress-info">
              正在处理 {processCurrent} / {processTotal} 篇文档 ({processProgress}%)
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: {processProgress}%"></div>
            </div>
            <p class="b3-label__text">正在扫描并修复文档指标，分页处理中，请耐心等待...</p>
            <p class="b3-label__text">大量文档处理可能需要较长时间，请勿关闭窗口</p>
          </div>
        {/if}
      </div>
    {/if}
    
    {#if activeTab === 2}
      <!-- 批量优先级重置页内容 -->
      <div class="fn__block form-item incremental-config-section">
        <div class="config-section">
          <h4>批量随机重置文档优先级</h4>
          <p class="help-text">将指定优先级范围的文档重置为随机的新优先级值</p>
          
          <div class="form-row">
            <div class="form-group">
              <label>当前优先级范围</label>
              <div class="range-inputs">
                <div class="range-input-group">
                  <label for="currentPriorityMin">下限（含）</label>
                  <input 
                    type="number" 
                    id="currentPriorityMin" 
                    bind:value={batchResetCurrentMin} 
                    min="0" 
                    max="10" 
                    step="0.01"
                  />
                </div>
                <div class="range-input-group">
                  <label for="currentPriorityMax">上限（含）</label>
                  <input 
                    type="number" 
                    id="currentPriorityMax" 
                    bind:value={batchResetCurrentMax} 
                    min="0" 
                    max="10" 
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>重置后优先级范围</label>
              <div class="range-inputs">
                <div class="range-input-group">
                  <label for="newPriorityMin">下限（含）</label>
                  <input 
                    type="number" 
                    id="newPriorityMin" 
                    bind:value={batchResetNewMin} 
                    min="0" 
                    max="10" 
                    step="0.01"
                  />
                </div>
                <div class="range-input-group">
                  <label for="newPriorityMax">上限（含）</label>
                  <input 
                    type="number" 
                    id="newPriorityMax" 
                    bind:value={batchResetNewMax} 
                    min="0" 
                    max="10" 
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group button-container">
              {#if isProcessingBatchReset}
                <div class="progress-info">
                  正在处理 {batchResetCurrent} / {batchResetTotal} 篇文档 ({batchResetProgress}%)
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" style="width: {batchResetProgress}%"></div>
                </div>
              {:else}
                <button class="reset-button" on:click={batchRandomResetPriority} disabled={isProcessingBatchReset}>开始重置</button>
              {/if}
            </div>
          </div>
          
          <!-- 清空所有文档指标和优先级 -->
          <div class="form-row">
            <div class="form-group">
              <div class="clear-data-section">
                <h4>清空所有文档指标和优先级</h4>
                <p class="help-text">完全卸载本插件前使用这个功能，删除文档优先级、文档指标、漫游记录和访问记录属性数据。</p>
                <p class="help-text">好的插件，不乱拉屎(≖ᴗ≖๑)</p>
                <div class="button-container">
                  {#if isProcessingClearData}
                    <div class="progress-info">
                      正在清空 {clearDataCurrent} / {clearDataTotal} 篇文档 ({clearDataProgress}%)
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar" style="width: {clearDataProgress}%"></div>
                    </div>
                  {:else}
                    <button class="clear-data-button" on:click={clearAllDocumentData} disabled={isProcessingClearData}>清空所有数据</button>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === 3}
      <!-- 智能推荐设置 -->
      <div class="fn__block form-item incremental-config-section">
        <div class="config-section">
          <h4>基准文档选择</h4>
          <div class="form-row align-center">
            <div class="form-group">
              <label>最近漫游 N 篇</label>
              <input
                type="number"
                min="1"
                max="50"
                bind:value={recommendRecentCount}
                disabled={$isLocked}
                readonly={$isLocked}
              />
              <p class="help-text">按 custom-roaming-last 排序，取最新 N 篇</p>
            </div>
            <div class="form-group">
              <label>漫游次数最多 M 篇</label>
              <input
                type="number"
                min="1"
                max="50"
                bind:value={recommendTopCount}
                disabled={$isLocked}
                readonly={$isLocked}
              />
              <p class="help-text">按 custom-roaming-count 排序，取次数最多的 M 篇</p>
            </div>
          </div>
        </div>

        <div class="config-section">
          <h4>候选与输出</h4>
          <div class="form-row align-center">
            <div class="form-group">
              <label>推荐条数</label>
              <input
                type="number"
                min="3"
                max="50"
                bind:value={recommendTopK}
                disabled={$isLocked}
                readonly={$isLocked}
              />
            </div>
            <div class="form-group">
              <label>候选集上限</label>
              <input
                type="number"
                min="20"
                max="500"
                bind:value={recommendMaxCandidates}
                disabled={$isLocked}
                readonly={$isLocked}
              />
              <p class="help-text">限制参与相似度计算的最大文档数，避免计算过重</p>
            </div>
            <div class="form-group">
              <label>采样段落上限</label>
              <input
                type="number"
                min="3"
                max="20"
                bind:value={recommendMaxParagraphs}
                disabled={$isLocked}
                readonly={$isLocked}
              />
              <p class="help-text">标题 + 头段 + 中段 + 尾段合计不超过该值</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
    
    <div class="b3-dialog__action">
      <button class="b3-button b3-button--cancel" on:click={onCancel}>{pluginInstance.i18n.cancel}</button>
      <div class="fn__space" />
      <button class="b3-button b3-button--text" on:click={onSaveSetting}>{pluginInstance.i18n.save}</button>
    </div>
  </div>
</div>

<style>
  .form-item {
    padding: 8px;
    width: 92%;
    margin: auto;
    font-size: 14px;
  }

  .form-item-tip {
    font-size: 12px !important;
    color: var(--b3-theme-on-background);
  }
  
  .form-item-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .form-item-label {
    flex: 1;
    padding-right: 10px;
  }
  
  .incremental-config-section {
    margin-top: 8px;
  }
  
  h3 {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--b3-theme-on-background);
  }
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--b3-theme-on-background);
  }
  
  .help-text {
    font-size: 12px;
    color: var(--b3-theme-on-surface-light);
    margin-bottom: 10px;
  }
  
  .config-section {
    margin-bottom: 16px;
    padding: 10px;
    border-radius: 4px;
    background-color: var(--b3-theme-surface);
  }
  
  .table-container {
    max-height: 120px;
    overflow-y: auto;
    border: 1px solid var(--b3-border-color);
    border-radius: 4px;
  }
  
  .metrics-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .metrics-table th, .metrics-table td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid var(--b3-border-color);
  }
  
  .metrics-table th {
    font-weight: 500;
    color: var(--b3-theme-on-background);
    background-color: var(--b3-theme-background);
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .form-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .form-group label {
    margin-bottom: 3px;
    font-size: 12px;
    color: var(--b3-theme-on-surface);
  }
  
  .delete-button {
    padding: 3px 6px;
    background-color: var(--b3-theme-error-lighter);
    color: var(--b3-theme-error);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
  }
  
  .delete-button:hover {
    background-color: var(--b3-theme-error-light);
  }
  
  .add-button {
    padding: 5px 10px;
    background-color: var(--b3-theme-primary-lighter);
    color: var(--b3-theme-primary);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    margin-top: 18px;
    font-size: 13px;
  }
  
  .add-button:hover {
    background-color: var(--b3-theme-primary-light);
  }
  
  .compact-section {
    padding: 8px;
    margin-bottom: 12px;
  }
  
  .small-group {
    max-width: 80px;
  }
  
  .tiny-group {
    max-width: 60px;
  }
  
  .button-group {
    max-width: 50px;
    display: flex;
    align-items: flex-end;
  }
  
  .sql-editor {
    height: 300px;
    resize: vertical;
    overflow: auto;
    font-family: monospace;
  }
  
  /* 进度条样式 */
  .progress-section {
    margin: 16px 0;
    background-color: var(--b3-theme-surface);
    border-radius: 4px;
    border: 1px solid var(--b3-theme-primary-lightest);
  }
  
  .progress-section h3 {
    margin-top: 0;
    color: var(--b3-theme-primary);
    font-size: 14px;
  }
  
  .progress-info {
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .progress-bar-container {
    height: 10px;
    background-color: var(--b3-theme-background);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .progress-bar {
    height: 100%;
    background-color: var(--b3-theme-primary);
    border-radius: 5px;
    transition: width 0.5s ease;
  }

  .config__tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--b3-border-color);
    margin-bottom: 12px;
  }

  .tab-items {
    display: flex;
  }

  .lock-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px 8px;
    border-radius: 4px;
    opacity: 0.7;
    transition: opacity 0.2s ease, background-color 0.2s ease;
    margin-left: auto;
  }

  .lock-btn:hover {
    opacity: 1;
    background-color: var(--b3-theme-surface-light);
  }

  /* 禁用状态样式 */
  input:disabled,
  textarea:disabled,
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input:readonly,
  textarea:readonly {
    background-color: var(--b3-theme-surface-light);
    color: var(--b3-theme-on-surface-light);
  }
  .tab-item {
    padding: 8px 24px;
    cursor: pointer;
    font-size: 15px;
    color: var(--b3-theme-on-background);
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s, color 0.2s;
  }
  .tab-item.active {
    color: var(--b3-theme-primary);
    border-bottom: 2px solid var(--b3-theme-primary);
    font-weight: bold;
  }
  .label-input-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .right-align-input {
    width: 120px;
    text-align: right;
  }
  .form-row.align-center {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .single-tip {
    font-size: 12px;
    color: var(--b3-theme-on-surface-light);
    margin: 2px 0 8px 0;
    text-align: left;
  }
  .left-align {
    text-align: left;
    padding-left: 2px;
  }
  .setting-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--b3-theme-on-background);
  }
  .right-align-input[type="number"] {
    width: 60px;
    text-align: center;
    margin-left: 8px;
  }
  
  /* 批量随机重置文档优先级相关样式 */
  .range-inputs {
    display: flex;
    gap: 20px;
    margin-top: 5px;
  }
  
  .range-input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .range-input-group label {
    font-size: 12px;
    color: var(--b3-theme-on-surface-light);
  }
  
  .range-input-group input {
    width: 80px;
    text-align: center;
  }
  
  .button-container {
    display: flex;
    justify-content: flex-start;
    margin-top: 10px;
  }
  
  .reset-button {
    padding: 6px 14px;
    background-color: var(--b3-theme-primary-lighter);
    color: var(--b3-theme-primary);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }
  
  .reset-button:hover {
    background-color: var(--b3-theme-primary-light);
  }
  
  .reset-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* 清空所有文档数据相关样式 */
  .clear-data-section {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid var(--b3-border-color);
    border-radius: 6px;
    background-color: var(--b3-theme-surface);
  }
  
  .clear-data-button {
    padding: 8px 16px;
    background-color: #ff6b6b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .clear-data-button:hover {
    background-color: #ff5252;
  }
  
  .clear-data-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #ccc;
  }
  
  @media (max-width: 600px) {
    .form-row.align-center {
      flex-direction: column;
      align-items: stretch;
    }
    .right-align-input {
      width: 100%;
      margin-left: 0;
    }
    .form-item-label, .left-align {
      padding-left: 0;
    }
  }
</style>
