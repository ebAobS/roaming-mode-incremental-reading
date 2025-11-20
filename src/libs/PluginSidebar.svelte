<!--
  - Roaming mode sidebar: hosts all roaming controls and insights inside SiYuan's dock.
  - Refactored to replace the old standalone roaming page.
-->

<script lang="ts">
  import { onMount } from "svelte"
  import { openTab, showMessage } from "siyuan"
  import RandomDocPlugin from "../index"
  import { storeName } from "../Constants"
  import RandomDocConfig, { FilterMode, ReviewMode } from "../models/RandomDocConfig"
  import IncrementalReviewer from "../service/IncrementalReviewer"
  import { showSettingMenu } from "../topbar"
  import { icons } from "../utils/svg"
  import MetricsPanel from "./MetricsPanel.svelte"
  import PriorityBarChart from "./PriorityBarChart.svelte"
  import type { Metric } from "../models/IncrementalConfig"

  export let pluginInstance: RandomDocPlugin

  const tabs = [
    { key: "filters", label: "筛选与指标" },
    { key: "chart", label: "点状图" },
    { key: "priority", label: "优先级排序表" },
    { key: "visited", label: "已漫游文档" },
  ]

  let activeTab = 0
  let probabilityTip = "等待漫游，点击下方按钮开始。"

  let isLoading = false
  let metricsLoading = false
  let priorityLoading = false
  let visitedLoading = false

  let storeConfig: RandomDocConfig
  let pr: IncrementalReviewer | null = null

  let notebooks: Array<{ id: string; name: string }> = []
  let selectedNotebooks: string[] = []
  let showNotebookSelector = false
  let filterMode = FilterMode.Notebook
  let rootId = ""
  let selectedDocTitle = ""

  let selectedTags: string[] = []
  let availableTags: string[] = []
  let isTagsLoading = false
  let showTagDropdown = false

  let isDocsLoading = false
  let showDocSelector = false
  let currentLevel: "notebooks" | "docs" | "childDocs" = "notebooks"
  let selectedNotebookForDoc: { id: string; name: string } | null = null
  let rootDocsList: Array<{ id: string; title: string }> = []
  let childDocsList: Array<{ id: string; title: string }> = []
  let docNavigationStack: any[] = []
  let showManualInput = false
  let manualInputId = ""

  let currentRndId: string | undefined = undefined
  let docMetrics: Metric[] = []
  let docPriority: { [key: string]: number } = {}

  let priorityBarPoints: Array<{ id: string; title?: string; priority: number }> = []
  let priorityBarMin = 0
  let priorityBarMax = 10
  let draggingPriority: number | null = null
  let draggingPriorityId: string | null = null
  let isRefreshingPriority = false

  let priorityList: Array<{ id: string; title: string; priority: number; visited: boolean }> = []
  let visitedDocs: Array<{ id: string; content: string; lastTime?: string }> = []
  const readNumberInput = (event: Event) => parseFloat((event.target as HTMLInputElement).value)

  $: currentDocTitle = (() => {
    if (!rootId) {
      return "请选择文档"
    }
    if (selectedDocTitle) {
      return selectedDocTitle
    }
    const found = rootDocsList.find((d) => d.id === rootId)
    if (found?.title) {
      return found.title
    }
    return `${rootId.slice(0, 8)}...`
  })()

  const setTips = (tip: string) => {
    probabilityTip = tip
  }

  const switchTab = async (index: number) => {
    activeTab = index
    if (index === 1) {
      await refreshPriorityBarPoints()
    } else if (index === 2) {
      await loadPriorityList()
    } else if (index === 3) {
      await loadVisitedDocs()
    }
  }

  export function triggerRoam() {
    switchTab(0)
    doIncrementalRandomDoc()
  }

  export function openVisitedTab() {
    switchTab(3)
  }

  export async function resetVisitedFromOutside() {
    await resetVisitedAndRefresh()
  }

  const ensureReviewer = async () => {
    if (!pr) {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
    return pr
  }

  const resetAllVisitCounts = async () => {
    const reviewer = await ensureReviewer()
    await reviewer.resetVisited()
  }

  const onFilterModeChange = async () => {
    storeConfig.filterMode = filterMode
    await pluginInstance.saveData(storeName, storeConfig)
    if (filterMode === FilterMode.Tag) {
      await loadAvailableTags()
    }
  }

  const toggleNotebook = (notebookId: string) => {
    if (selectedNotebooks.includes(notebookId)) {
      selectedNotebooks = selectedNotebooks.filter((id) => id !== notebookId)
    } else {
      selectedNotebooks = [...selectedNotebooks, notebookId]
    }
  }

  const getNotebookName = (notebookId: string) => {
    const notebook = notebooks.find((n) => n.id === notebookId)
    return notebook ? notebook.name : "未知笔记本"
  }

  const onNotebookChange = async () => {
    storeConfig.notebookId = selectedNotebooks.join(",")
    await pluginInstance.saveData(storeName, storeConfig)
    pr = null
    await ensureReviewer()
  }

  const loadAvailableTags = async () => {
    if (isTagsLoading) return
    isTagsLoading = true
    try {
      const reviewer = await ensureReviewer()
      availableTags = await reviewer.getAllAvailableTags()
    } catch (error) {
      pluginInstance.logger.error("加载标签失败", error)
      availableTags = []
    } finally {
      isTagsLoading = false
    }
  }

  const toggleTag = (tag: string) => {
    selectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
  }

  const confirmTagSelection = async () => {
    storeConfig.tags = selectedTags
    await pluginInstance.saveData(storeName, storeConfig)
    showTagDropdown = false
    pr = null
    await ensureReviewer()
  }

  const clearAllTags = async () => {
    selectedTags = []
    storeConfig.tags = []
    await pluginInstance.saveData(storeName, storeConfig)
    showTagDropdown = false
    pr = null
    await ensureReviewer()
  }

  const startDocumentSelection = () => {
    showDocSelector = true
    currentLevel = "notebooks"
    selectedNotebookForDoc = null
    rootDocsList = []
    childDocsList = []
    docNavigationStack = []
  }

  const selectNotebookForDoc = async (notebook: { id: string; name: string }) => {
    if (isDocsLoading) return
    isDocsLoading = true
    selectedNotebookForDoc = notebook
    currentLevel = "docs"
    childDocsList = []
    docNavigationStack = []

    try {
      const result = await pluginInstance.kernelApi.getRootDocs(notebook.id)
      const actualData = (result?.data ?? []) as any[]
      rootDocsList = actualData.map((doc) => ({ id: doc.id, title: doc.title || "(无标题)" }))
    } catch (error) {
      pluginInstance.logger.error("获取根文档失败", error)
      rootDocsList = []
    } finally {
      isDocsLoading = false
    }
  }

  const exploreDocument = async (docId: string, docTitle: string) => {
    if (isDocsLoading || !selectedNotebookForDoc) return
    isDocsLoading = true

    docNavigationStack.push({
      level: currentLevel,
      data: currentLevel === "docs" ? [...rootDocsList] : [...childDocsList],
    })
    currentLevel = "childDocs"

    try {
      const result = await pluginInstance.kernelApi.getChildDocs(docId, selectedNotebookForDoc.id)
      const actualData = (result?.data ?? []) as any[]
      childDocsList = actualData.map((doc) => ({ id: doc.id, title: doc.title || "(无标题)" }))
    } catch (error) {
      pluginInstance.logger.error("获取子文档失败", error)
      childDocsList = []
    } finally {
      isDocsLoading = false
    }
  }

  const backToPreviousLevel = () => {
    if (docNavigationStack.length === 0) {
      currentLevel = "docs"
      childDocsList = []
      return
    }
    const previousState = docNavigationStack.pop()
    currentLevel = previousState.level
    if (currentLevel === "docs") {
      rootDocsList = previousState.data
      childDocsList = []
    } else {
      childDocsList = previousState.data
    }
  }

  const backToNotebookSelection = () => {
    currentLevel = "notebooks"
    selectedNotebookForDoc = null
    rootDocsList = []
    childDocsList = []
    docNavigationStack = []
  }

  const selectDocument = async (docId: string, docTitle: string) => {
    rootId = docId
    selectedDocTitle = docTitle
    showDocSelector = false
    storeConfig.rootId = rootId
    storeConfig.rootDocTitle = docTitle
    await pluginInstance.saveData(storeName, storeConfig)
    pr = null
    await ensureReviewer()
  }

  const switchToManualInput = () => {
    showManualInput = true
    manualInputId = ""
  }

  const cancelManualInput = () => {
    showManualInput = false
    manualInputId = ""
  }

  const confirmManualInput = async () => {
    if (!manualInputId || manualInputId.trim() === "") {
      showMessage("请输入有效的文档ID", 3000, "error")
      return
    }
    const trimmedId = manualInputId.trim()
    try {
      const title = await pluginInstance.kernelApi.getDocTitle(trimmedId)
      await selectDocument(trimmedId, title || "")
      showManualInput = false
      showMessage(`已设置根文档: ${title || trimmedId}`, 2000, "info")
    } catch (error) {
      pluginInstance.logger.error("验证文档ID失败", error)
      const confirmed = confirm(`无法验证文档ID。是否仍使用 \"${trimmedId}\" 作为根文档？`)
      if (confirmed) {
        await selectDocument(trimmedId, "")
        showManualInput = false
      }
    }
  }

  const refreshCurrentDocMetrics = async () => {
    if (!currentRndId) {
      docPriority = {}
      docMetrics = []
      return
    }
    metricsLoading = true
    try {
      const reviewer = await ensureReviewer()
      const processingDocId = currentRndId
      const docPriorityData = await reviewer.getDocPriorityData(processingDocId)
      if (processingDocId !== currentRndId) {
        return
      }
      docPriority = docPriorityData.metrics
      docMetrics = reviewer.getMetrics()
    } catch (error) {
      pluginInstance.logger.error("获取文档指标失败", error)
      docPriority = {}
      docMetrics = []
    } finally {
      metricsLoading = false
    }
  }

  const refreshPriorityBarPoints = async () => {
    if (!storeConfig || isRefreshingPriority) return
    const reviewer = await ensureReviewer()
    try {
      isRefreshingPriority = true
      const latestPriorityList = await reviewer.getPriorityList(storeConfig)
      priorityBarPoints = latestPriorityList
      priorityBarMin = 0
      priorityBarMax = 10
    } catch (error) {
      pluginInstance.logger.error("刷新点状图失败", error)
      priorityBarPoints = []
    } finally {
      isRefreshingPriority = false
    }
  }

  const updateDocPriorityByValue = async (docId: string, newPriority: number) => {
    const reviewer = await ensureReviewer()
    const metrics = reviewer.getMetrics()
    await Promise.all(metrics.map((metric) => reviewer.updateDocMetric(docId, metric.id, newPriority)))
    if (typeof reviewer.updateDocPriority === "function") {
      await reviewer.updateDocPriority(docId, newPriority)
    }
  }

  const handlePriorityInputInList = async (docId: string, newValue: number) => {
    newValue = parseFloat(newValue.toFixed(2))
    try {
      await updateDocPriorityByValue(docId, newValue)
      priorityList = priorityList
        .map((item) => (item.id === docId ? { ...item, priority: newValue } : item))
        .sort((a, b) => b.priority - a.priority)
      await refreshPriorityBarPoints()
    } catch (error) {
      pluginInstance.logger.error("设置优先级失败", error)
      showMessage("设置优先级失败: " + error.message, 3000, "error")
    }
  }

  const increasePriorityInList = async (docId: string) => {
    const doc = priorityList.find((d) => d.id === docId)
    if (!doc) return
    const newValue = Math.min(10, parseFloat((doc.priority + 0.1).toFixed(2)))
    await handlePriorityInputInList(docId, newValue)
  }

  const decreasePriorityInList = async (docId: string) => {
    const doc = priorityList.find((d) => d.id === docId)
    if (!doc) return
    const newValue = Math.max(0, parseFloat((doc.priority - 0.1).toFixed(2)))
    await handlePriorityInputInList(docId, newValue)
  }

  const handlePriorityBarDragging = (e: CustomEvent) => {
    draggingPriority = e.detail.priority
    draggingPriorityId = e.detail.id
  }

  const handlePriorityBarChange = async (e: CustomEvent) => {
    const { priority, id } = e.detail
    if (!id) return
    const reviewer = await ensureReviewer()
    const docPriorityData = await reviewer.getDocPriorityData(id)
    const metrics = reviewer.getMetrics()
    const currentPriority = await (reviewer as any)["calculatePriority"](docPriorityData)
    if (currentPriority.priority === 0) {
      let totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0)
      for (const metric of metrics) {
        const val = totalWeight > 0 ? priority * (metric.weight / totalWeight) : priority
        await reviewer.updateDocMetric(id, metric.id, val)
      }
    } else {
      const ratio = priority / currentPriority.priority
      for (const metric of metrics) {
        const val = (docPriorityData.metrics[metric.id] || 0) * ratio
        await reviewer.updateDocMetric(id, metric.id, Math.max(0, Math.min(10, val)))
      }
    }
    if (typeof reviewer.updateDocPriority === "function") {
      await reviewer.updateDocPriority(id, priority)
    }
    if (id === currentRndId) {
      docPriority = (await reviewer.getDocPriorityData(id)).metrics
    }
    await refreshPriorityBarPoints()
    draggingPriority = null
    draggingPriorityId = null
  }

  const handleOpenDocument = async (e: CustomEvent) => {
    const docId = e.detail.id
    if (!docId) return
    try {
      await openTab({ app: pluginInstance.app, doc: { id: docId } })
    } catch (error) {
      pluginInstance.logger.error("打开文档失败", error)
      showMessage("打开文档失败: " + error.message, 3000, "error")
    }
  }

  const formatRoamingTime = (isoTime?: string) => {
    if (!isoTime) return ""
    const date = new Date(isoTime)
    if (Number.isNaN(date.getTime())) return ""
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const loadPriorityList = async () => {
    priorityLoading = true
    priorityList = []
    try {
      const reviewer = await ensureReviewer()
      const priorityData = await reviewer.getPriorityList(storeConfig)
      const visited = await reviewer.getVisitedDocs(storeConfig)
      const visitedSet = new Set(visited.map((v) => v.id))
      const withTitle = await Promise.all(
        priorityData.map(async (item) => {
          const title = (await pluginInstance.kernelApi.getDocTitle(item.id)) || "(无标题)"
          return { ...item, title, visited: visitedSet.has(item.id) }
        }),
      )
      priorityList = withTitle.sort((a, b) => b.priority - a.priority)
    } catch (error) {
      pluginInstance.logger.error("加载优先级列表失败", error)
      showMessage("加载优先级列表失败: " + error.message, 3000, "error")
      priorityList = []
    } finally {
      priorityLoading = false
    }
  }

  const loadVisitedDocs = async () => {
    visitedLoading = true
    try {
      const reviewer = await ensureReviewer()
      const docs = await reviewer.getVisitedDocs(storeConfig)
      visitedDocs = await Promise.all(
        docs.map(async (doc) => {
          const lastTime = await reviewer.getRoamingLastTime(doc.id)
          return { ...doc, lastTime }
        }),
      )
      visitedDocs.sort((a, b) => {
        if (!a.lastTime && !b.lastTime) return 0
        if (!a.lastTime) return 1
        if (!b.lastTime) return -1
        return b.lastTime.localeCompare(a.lastTime)
      })
    } catch (error) {
      pluginInstance.logger.error("加载已漫游列表失败", error)
      visitedDocs = []
    } finally {
      visitedLoading = false
    }
  }

  const resetVisitedAndRefresh = async () => {
    await resetAllVisitCounts()
    if (activeTab === 3) {
      await loadVisitedDocs()
    }
  }

  const openDoc = (docId: string) => {
    openTab({ app: pluginInstance.app, doc: { id: docId } })
  }

  const doIncrementalRandomDoc = async () => {
    storeConfig = await pluginInstance.safeLoad(storeName)
    if (storeConfig.filterMode === FilterMode.SQL && (!storeConfig.sqlQuery || storeConfig.sqlQuery.trim() === "")) {
      showMessage("请输入SQL查询语句", 3000, "info")
      return
    }

    isLoading = true
    let newDocId: string | undefined
    let isAbsolutePriority = false
    const reviewer = await ensureReviewer()

    try {
      const total = await reviewer.getTotalDocCount(storeConfig)
      if (total === 0) {
        showMessage("没有符合条件的文档，请先准备文档后再试", 3000, "info")
        return
      }

      const result = await reviewer.getRandomDoc(storeConfig)
      if (typeof result === "object" && result !== null && "docId" in result) {
        newDocId = result.docId as string
        isAbsolutePriority = !!result.isAbsolutePriority
      } else {
        newDocId = result as string
      }

      if (!newDocId) {
        await resetAllVisitCounts()
        setTimeout(doIncrementalRandomDoc, 300)
        return
      }

      currentRndId = newDocId
      const blockResult = await pluginInstance.kernelApi.getBlockByID(currentRndId)
      if (!blockResult) {
        showMessage("文档不存在或已删除", 3000, "error")
        currentRndId = undefined
        return
      }

      await refreshCurrentDocMetrics()

      const selectionProbability = (() => {
        try {
          const val = reviewer.getLastSelectionProbability()
          return `${val.toFixed(4)}%`
        } catch {
          return "计算出错"
        }
      })()

      const visitedCount = await reviewer.getVisitedCount(storeConfig)
      const remainingCount = total - visitedCount
      if (isAbsolutePriority) {
        let rankText = "未知"
        try {
          const priorityData = await reviewer.getPriorityList(storeConfig)
          const rank = priorityData.findIndex((doc) => doc.id === currentRndId)
          if (rank !== -1) {
            rankText = (rank + 1).toString()
          }
        } catch (error) {
          pluginInstance.logger.error("获取优先级位次失败", error)
        }
        setTips(`展卷乃无言的情意：缘自优先级第${rankText}的顺序，穿越星辰遇见你，三秋霜雪印马蹄。${total}篇文档已剩${remainingCount}`)
      } else {
        setTips(`展卷乃无言的情意：以${selectionProbability}的机遇，穿越星辰遇见你，三秋霜雪印马蹄。${total}篇文档已剩${remainingCount}`)
      }

      if (storeConfig) {
        ;(storeConfig as any).currentRndId = currentRndId
        await pluginInstance.saveData(storeName, storeConfig)
      }

      try {
        await reviewer.incrementRoamingCount(currentRndId)
      } catch (error) {
        pluginInstance.logger.error("增加漫游次数失败", error)
      }

      await refreshPriorityBarPoints()
      if (activeTab === 2) {
        await loadPriorityList()
      }
      if (activeTab === 3) {
        await loadVisitedDocs()
      }

      await openTab({ app: pluginInstance.app, doc: { id: currentRndId } })
    } catch (error: any) {
      pluginInstance.logger.error("漫游失败", error)
      showMessage("漫游失败: " + (error?.message || error), 3000, "error")
      currentRndId = undefined
      docPriority = {}
      docMetrics = []
    } finally {
      isLoading = false
    }
  }

  onMount(async () => {
    storeConfig = await pluginInstance.safeLoad(storeName)
    if (!storeConfig.reviewMode) {
      storeConfig.reviewMode = ReviewMode.Incremental
      await pluginInstance.saveData(storeName, storeConfig)
    }

    const res = await pluginInstance.kernelApi.lsNotebooks()
    notebooks = (res?.data as any)?.notebooks ?? []
    notebooks = notebooks.filter((notebook) => !notebook.closed)

    if (storeConfig?.notebookId) {
      selectedNotebooks = storeConfig.notebookId.split(",").filter((id) => id.trim() !== "")
    } else if (notebooks.length > 0) {
      selectedNotebooks = notebooks.map((n) => n.id)
      storeConfig.notebookId = selectedNotebooks.join(",")
      await pluginInstance.saveData(storeName, storeConfig)
    }

    if (Array.isArray(storeConfig.tags)) {
      selectedTags = [...storeConfig.tags]
    } else if (typeof storeConfig.tags === "string") {
      selectedTags = storeConfig.tags.split(",").map((t) => t.trim()).filter(Boolean)
      storeConfig.tags = selectedTags
      await pluginInstance.saveData(storeName, storeConfig)
    }

    filterMode = storeConfig.filterMode ?? FilterMode.Notebook
    rootId = storeConfig.rootId ?? ""
    selectedDocTitle = storeConfig.rootDocTitle ?? ""

    if (storeConfig.reviewMode === ReviewMode.Incremental) {
      await ensureReviewer()
      const savedDocId = (storeConfig as any).currentRndId
      if (savedDocId) {
        const blockResult = await pluginInstance.kernelApi.getBlockByID(savedDocId)
        if (blockResult) {
          currentRndId = savedDocId
          await refreshCurrentDocMetrics()
          await refreshPriorityBarPoints()
        } else {
          ;(storeConfig as any).currentRndId = undefined
          await pluginInstance.saveData(storeName, storeConfig)
        }
      }
    }
  })
</script>

<div class="plugin-sidebar">
  <div class="sidebar-header">
    <div class="title-group">
      <div class="title">{pluginInstance.i18n.sidebarTitle || "漫游面板"}</div>
      <div class="subtitle">漫游式渐进阅读</div>
    </div>
    <div class="header-actions">
      <button class="icon-btn" on:click={() => showSettingMenu(pluginInstance)} title={pluginInstance.i18n.setting}>
        {@html icons.iconSetting}
      </button>
    </div>
  </div>

  <div class="tab-bar">
    {#each tabs as tab, index}
      <button class:selected={activeTab === index} on:click={() => switchTab(index)}>{tab.label}</button>
    {/each}
  </div>

  <div class="tab-panels">
    {#if activeTab === 0}
      <div class="tip-banner">
        <div class="tip-icon">✨</div>
        <div class="tip-text">{probabilityTip}</div>
      </div>

      <div class="section">
        <div class="section-title">筛选文档</div>
        <div class="filter-row">
          <span class="filter-label">筛选</span>
          <select bind:value={filterMode} class="filter-select" on:change={onFilterModeChange}>
            <option value={FilterMode.Notebook}>笔记本</option>
            <option value={FilterMode.Root}>根文档</option>
            <option value={FilterMode.Tag}>标签</option>
          </select>
        </div>

        {#if filterMode === FilterMode.Notebook}
          <div class="filter-row">
            <div class="selector-wrapper">
              <button class="filter-button" on:click={() => (showNotebookSelector = !showNotebookSelector)}>
                {#if selectedNotebooks.length === 0}
                  笔记本：请选择
                {:else if selectedNotebooks.length === 1}
                  {getNotebookName(selectedNotebooks[0])}
                {:else}
                  已选{selectedNotebooks.length}个笔记本
                {/if}
              </button>
              {#if showNotebookSelector}
                <div class="dropdown-list">
                  {#each notebooks as notebook (notebook.id)}
                    <label class="dropdown-item">
                      <input type="checkbox" checked={selectedNotebooks.includes(notebook.id)} on:change={() => toggleNotebook(notebook.id)} />
                      {notebook.name}
                    </label>
                  {/each}
                  <div class="confirm-buttons">
                    <button class="confirm-btn" on:click={() => { showNotebookSelector = false; onNotebookChange(); }}>确定</button>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        {:else if filterMode === FilterMode.Root}
          <div class="filter-row">
            <button class="filter-button" on:click={startDocumentSelection}>{currentDocTitle}</button>
          </div>
        {:else if filterMode === FilterMode.Tag}
          <div class="filter-row">
            <div class="selector-wrapper">
              <button class="filter-button" on:click={() => { showTagDropdown = !showTagDropdown; loadAvailableTags(); }}>
                {#if selectedTags.length === 0}
                  请选择标签
                {:else if selectedTags.length === 1}
                  {selectedTags[0]}
                {:else}
                  已选{selectedTags.length}个标签
                {/if}
              </button>
              {#if showTagDropdown && !isTagsLoading}
                <div class="dropdown-list">
                  {#if availableTags.length === 0}
                    <div class="empty-message">没有找到标签</div>
                  {:else}
                    {#each availableTags as tag}
                      <label class="dropdown-item">
                        <input type="checkbox" checked={selectedTags.includes(tag)} on:change={() => toggleTag(tag)} />
                        #{tag}
                      </label>
                    {/each}
                  {/if}
                  <div class="confirm-buttons">
                    <button class="confirm-btn" on:click={clearAllTags}>清空</button>
                    <button class="confirm-btn" on:click={confirmTagSelection}>确定</button>
                  </div>
                </div>
              {/if}
              {#if isTagsLoading}
                <div class="loading-message">加载标签...</div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <div class="section">
        <div class="section-title">文档指标 / 优先级</div>
        {#if currentRndId && docMetrics.length > 0}
          <MetricsPanel
            pluginInstance={pluginInstance}
            docId={currentRndId}
            reviewer={pr}
            metrics={docMetrics}
            {docPriority}
          />
        {:else if metricsLoading}
          <div class="placeholder">正在加载指标...</div>
        {:else}
          <div class="placeholder">点击下方“继续漫游”后，将显示当前文档指标。</div>
        {/if}
      </div>

      <div class="action-section">
        <button class="primary-button" on:click={doIncrementalRandomDoc} disabled={isLoading}>
          {#if isLoading}
            <span class="loading-spinner"></span> 漫游中...
          {:else}
            继续漫游
          {/if}
        </button>
        <div class="secondary-actions">
          <button class="secondary-button" on:click={() => switchTab(3)}>已漫游文档</button>
          <button class="secondary-button" on:click={() => switchTab(2)}>优先级表</button>
        </div>
      </div>
    {:else if activeTab === 1}
      <div class="section">
        <div class="section-title">优先级点状图（竖向）</div>
        {#if priorityBarPoints.length === 0}
          <div class="placeholder">暂无数据，先执行一次漫游或刷新。</div>
        {:else}
          <PriorityBarChart
            points={priorityBarPoints}
            currentId={currentRndId}
            minPriority={priorityBarMin}
            maxPriority={priorityBarMax}
            height={320}
            orientation="vertical"
            on:dragging={handlePriorityBarDragging}
            on:change={handlePriorityBarChange}
            on:openDocument={handleOpenDocument}
          />
        {/if}
        <div class="toolbar-row">
          <button class="secondary-button" on:click={refreshPriorityBarPoints}>刷新点图</button>
        </div>
      </div>
    {:else if activeTab === 2}
      <div class="section">
        <div class="section-title">优先级排序表</div>
        <div class="toolbar-row">
          <button class="secondary-button" on:click={loadPriorityList} disabled={priorityLoading}>
            {priorityLoading ? "加载中..." : "刷新列表"}
          </button>
        </div>
        {#if priorityLoading}
          <div class="placeholder">正在加载优先级数据...</div>
        {:else if priorityList.length === 0}
          <div class="placeholder">暂无优先级数据。</div>
        {:else}
          <ul class="priority-list">
            {#each priorityList as doc}
              <li>
                <div class="priority-main">
                  <span
                    class="priority-title"
                    role="button"
                    tabindex="0"
                    on:click={() => openDoc(doc.id)}
                    on:keydown={(e) => e.key === "Enter" && openDoc(doc.id)}
                  >{doc.title}</span>
                  <span class="priority-id">{doc.id.slice(0, 6)}...</span>
                </div>
                <div class="priority-controls">
                  <button class="priority-btn" on:click={() => decreasePriorityInList(doc.id)}>-</button>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={doc.priority}
                    on:change={(e) => handlePriorityInputInList(doc.id, readNumberInput(e))}
                  />
                  <button class="priority-btn" on:click={() => increasePriorityInList(doc.id)}>+</button>
                  <span class="visited-flag">{doc.visited ? "✓" : "·"}</span>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {:else}
      <div class="section">
        <div class="section-title">已漫游文档</div>
        <div class="toolbar-row">
          <button class="secondary-button" on:click={loadVisitedDocs} disabled={visitedLoading}>刷新</button>
          <button class="secondary-button danger" on:click={resetVisitedAndRefresh}>重置记录</button>
        </div>
        {#if visitedLoading}
          <div class="placeholder">加载中...</div>
        {:else if visitedDocs.length === 0}
          <div class="placeholder">暂无已漫游文档</div>
        {:else}
          <ul class="visited-list">
            {#each visitedDocs as doc}
              <li>
                <span
                  class="visited-title"
                  role="button"
                  tabindex="0"
                  on:click={() => openDoc(doc.id)}
                  on:keydown={(e) => e.key === "Enter" && openDoc(doc.id)}
                >{doc.content || "(无标题)"}</span>
                <small>{formatRoamingTime(doc.lastTime)}</small>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>

  {#if showDocSelector}
    <div class="overlay" role="button" tabindex="0" on:click={() => (showDocSelector = false)} on:keydown={(e) => e.key === "Escape" && (showDocSelector = false)}>
      <div class="tree-selector" role="none" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="tree-header">
          <h3>选择根文档</h3>
          <button class="close-btn" on:click={() => (showDocSelector = false)}>×</button>
        </div>
        <div class="tree-body">
          {#if currentLevel === "notebooks"}
            <div class="tree-title">选择笔记本</div>
            <div class="tree-content">
              {#each notebooks as notebook}
                <div
                  class="tree-item"
                  role="button"
                  tabindex="0"
                  on:click={() => selectNotebookForDoc(notebook)}
                  on:keydown={(e) => e.key === "Enter" && selectNotebookForDoc(notebook)}
                >{notebook.name}</div>
              {/each}
            </div>
          {:else if currentLevel === "docs"}
            <div class="tree-toolbar">
              <button class="link-btn" on:click={backToNotebookSelection}>返回</button>
              <button class="link-btn" on:click={switchToManualInput}>输入ID</button>
            </div>
            <div class="tree-content">
              {#if isDocsLoading}
                <div class="placeholder">加载中...</div>
              {:else if rootDocsList.length === 0}
                <div class="placeholder">该笔记本下没有根文档</div>
              {:else}
                {#each rootDocsList as doc}
                  <div class="tree-item">
                    <span>{doc.title}</span>
                    <div class="tree-actions">
                      <button class="link-btn" on:click={() => exploreDocument(doc.id, doc.title)}>查看子文档</button>
                      <button class="link-btn" on:click={() => selectDocument(doc.id, doc.title)}>选择</button>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {:else}
            <div class="tree-toolbar">
              <button class="link-btn" on:click={backToPreviousLevel}>返回</button>
              <button class="link-btn" on:click={switchToManualInput}>输入ID</button>
            </div>
            <div class="tree-content">
              {#if isDocsLoading}
                <div class="placeholder">加载中...</div>
              {:else if childDocsList.length === 0}
                <div class="placeholder">该文档下没有子文档</div>
              {:else}
                {#each childDocsList as doc}
                  <div class="tree-item">
                    <span>{doc.title}</span>
                    <div class="tree-actions">
                      <button class="link-btn" on:click={() => exploreDocument(doc.id, doc.title)}>查看子文档</button>
                      <button class="link-btn" on:click={() => selectDocument(doc.id, doc.title)}>选择</button>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if showManualInput}
    <div class="overlay" role="button" tabindex="0" on:click={cancelManualInput} on:keydown={(e) => e.key === "Escape" && cancelManualInput()}>
      <div class="manual-input" role="none" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="tree-header">
          <h3>手动输入文档ID</h3>
          <button class="close-btn" on:click={cancelManualInput}>×</button>
        </div>
        <div class="manual-body">
          <label for="manual-id-input">文档ID</label>
          <input
            id="manual-id-input"
            type="text"
            class="b3-text-field"
            bind:value={manualInputId}
            placeholder="请输入文档ID"
            on:keydown={(e) => e.key === "Enter" && confirmManualInput()}
          />
          <div class="manual-actions">
            <button class="secondary-button" on:click={cancelManualInput}>取消</button>
            <button class="primary-button" on:click={confirmManualInput}>确定</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .plugin-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--b3-theme-background);
    color: var(--b3-theme-on-background);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--b3-theme-border);
    flex-shrink: 0;
  }

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 12px;
    color: var(--b3-theme-on-surface);
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .icon-btn {
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-surface);
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
  }

  .tab-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid var(--b3-theme-border);
    flex-shrink: 0;
  }

  .tab-bar button {
    background: transparent;
    border: none;
    padding: 10px 0;
    cursor: pointer;
    font-size: 13px;
    border-right: 1px solid var(--b3-theme-border);
  }

  .tab-bar button:last-child {
    border-right: none;
  }

  .tab-bar button.selected {
    color: var(--b3-theme-primary);
    font-weight: 600;
    background: var(--b3-theme-surface);
  }

  .tab-panels {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tip-banner {
    display: flex;
    gap: 8px;
    background: var(--b3-theme-primary-lightest, rgba(60, 120, 255, 0.1));
    border: 1px solid var(--b3-theme-primary);
    color: var(--b3-theme-primary);
    padding: 10px 12px;
    border-radius: 6px;
    align-items: center;
  }

  .tip-icon {
    font-size: 18px;
  }

  .section {
    border: 1px solid var(--b3-theme-border);
    border-radius: 8px;
    padding: 12px;
    background: var(--b3-theme-surface);
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .filter-row {
    margin-bottom: 8px;
    position: relative;
  }

  .filter-label {
    font-size: 13px;
    margin-right: 8px;
  }

  .filter-select {
    width: 100%;
    padding: 6px 8px;
    font-size: 13px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background: var(--b3-theme-surface);
  }

  .selector-wrapper {
    position: relative;
  }

  .filter-button {
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    color: var(--b3-theme-on-surface);
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-background);
    border-radius: 4px;
    text-align: left;
    cursor: pointer;
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--b3-theme-surface);
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    z-index: 10;
    max-height: 240px;
    overflow-y: auto;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 13px;
    gap: 8px;
  }

  .dropdown-item:hover {
    background: var(--b3-theme-hover);
  }

  .confirm-buttons {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid var(--b3-theme-border);
  }

  .confirm-btn {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-background);
    border-radius: 4px;
    cursor: pointer;
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .primary-button {
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    background: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary);
    font-size: 14px;
    cursor: pointer;
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .secondary-actions {
    display: flex;
    gap: 8px;
  }

  .secondary-button {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    background: var(--b3-theme-background);
    cursor: pointer;
  }

  .secondary-button.danger {
    color: var(--b3-theme-error);
    border-color: var(--b3-theme-error);
  }

  .loading-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 6px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .placeholder {
    padding: 8px 10px;
    color: var(--b3-theme-on-surface);
    opacity: 0.7;
    font-size: 13px;
  }

  .toolbar-row {
    display: flex;
    gap: 8px;
    margin: 8px 0;
  }

  .priority-list,
  .visited-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .priority-list li,
  .visited-list li {
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    padding: 8px 10px;
    background: var(--b3-theme-background);
  }

  .priority-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .priority-title {
    cursor: pointer;
    color: var(--b3-theme-primary);
  }

  .priority-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .priority-controls input {
    width: 70px;
    padding: 4px 6px;
  }

  .priority-btn {
    width: 26px;
    height: 26px;
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-surface);
    border-radius: 4px;
    cursor: pointer;
  }

  .visited-title {
    color: var(--b3-theme-primary);
    cursor: pointer;
    display: block;
  }

  .visited-list small {
    color: var(--b3-theme-on-surface);
    opacity: 0.6;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .tree-selector,
  .manual-input {
    width: 520px;
    max-width: 90vw;
    max-height: 80vh;
    background: var(--b3-theme-background);
    border-radius: 8px;
    border: 1px solid var(--b3-theme-border);
    display: flex;
    flex-direction: column;
  }

  .tree-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--b3-theme-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tree-body {
    padding: 0 0 12px 0;
  }

  .tree-title {
    padding: 12px 16px;
    font-weight: 600;
  }

  .tree-toolbar {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
  }

  .tree-content {
    padding: 0 16px 12px 16px;
    max-height: 60vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tree-item {
    padding: 10px 12px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tree-actions {
    display: flex;
    gap: 6px;
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--b3-theme-primary);
    cursor: pointer;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
  }

  .manual-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .manual-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
