<!--
  - Roaming mode sidebar: hosts all roaming controls and insights inside SiYuan's dock.
  - Refactored to replace the old standalone roaming page.
-->

<script lang="ts">
  import { onMount } from "svelte"
  import { openMobileFileById, openTab, showMessage } from "siyuan"
  import RandomDocPlugin from "../index"
  import { storeName } from "../Constants"
  import RandomDocConfig, { FilterMode, ReviewMode } from "../models/RandomDocConfig"
  import IncrementalReviewer from "../service/IncrementalReviewer"
  import RecommendationService, { buildRecommendationConfig } from "../service/RecommendationService"
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
    { key: "roamingCount", label: "漫游次数排序表" },
  ]

  let activeTab = 0
  $: currentTabKey = tabs[activeTab]?.key || ""
  let probabilityTip = "等待漫游，点击下方按钮开始"
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
  let sqlQuery = ""

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
  let roamingCountList: Array<{ id: string; title: string; roamingCount: number }> = []
  let roamingCountLoading = false
  const readNumberInput = (event: Event) => parseFloat((event.target as HTMLInputElement).value)
  let showSqlExamples = false
  let sqlExamples: Array<{ title: string; sql: string }> = []
  let newSqlTitle = ""
  let newSqlBody = ""
  let draggedItem: { id: string; priority: number } | null = null
  let draggedIndex = -1
  let dragOverIndex = -1

  // 推荐相关状态
  let recommendationService: RecommendationService | null = null
  let recommendLoading = false
  let recommendations: Array<{ id: string; title: string; score: number; anchors: string[] }> = []
  let recommendError = ""
  let recommendRecentCount = 3
  let recommendTopCount = 2
  let recommendTopK = 8
  let recommendMaxCandidates = 120
  let recommendMaxParagraphs = 8
  let aligningRecommendationPriority = false
  let autoAlignRecommendationPriority = false
  const priorityAlignHelpText = `
优先级对齐，是将智能推荐的文档的优先级数值分布调整为与相关性百分比值的分布一致，并保持极值不变。
调整方法大致为将相关性值归一化，再反归一化为优先级的值。
如果您的思源的文档数量很多，不可能逐一自行调整优先级，这个功能可大大加快文档您对众多文档的优先级管理。
具体数值调整的算法：
①. 设推荐的文档数量为x，找到列表所有文档中原先的优先级的最大值d与最小值s，如果d-s小于3，则增加d减小s，使d-s=3，如果d-s大于或等于3，则d和s都不变，称d-s为极差。
②. 将推荐文档的相关性数值归一化，设推荐文档的相关性从小到大为r1,r2,...,rx，归一化公式：ki=(ri-r1)/(rx-r1)得到k1，k2,...,kx值，一定有：k1=0，kx=1。
③. 将k1，k2,...,kx反归一化，算法是②的逆向操作，最小值是s，最大值是d，得到t1,t2...,tx，这样就得到了极差不变，分布与相关性一致的数据
④. 更新优先级，相关性最小的文档优先级更新为k1，第二小的文档优先级更新为k2，...，相关性最大的文档的优先级更新为kx。
  `.trim()

  type FilterHistoryState = {
    notebookIds?: string[]
    rootId?: string
    rootDocTitle?: string
    tags?: string[]
    sqlQuery?: string
  }

  type FilterHistoryItem = {
    id: string
    mode: FilterMode
    label: string
    state: FilterHistoryState
    pinned?: boolean
    timestamp: number
  }

  const MAX_FILTER_HISTORY = 10
  let filterHistory: FilterHistoryItem[] = []
  let showFilterHistory = false

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
    const key = tabs[index]?.key
    if (key === "chart") {
      await refreshPriorityBarPoints()
    } else if (key === "priority") {
      await loadPriorityList()
    } else if (key === "visited") {
      await loadVisitedDocs()
    } else if (key === "roamingCount") {
      await loadRoamingCountList()
    }
  }

  export function triggerRoam() {
    switchTab(0)
    return doIncrementalRandomDoc()
  }

  export function openVisitedTab() {
    const visitedIndex = tabs.findIndex((tab) => tab.key === "visited")
    switchTab(visitedIndex === -1 ? 0 : visitedIndex)
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

  const ensureRecommendationService = () => {
    if (!recommendationService) {
      recommendationService = new RecommendationService(pluginInstance)
    }
    return recommendationService
  }

  const resetAllVisitCounts = async () => {
    const reviewer = await ensureReviewer()
    await reviewer.resetVisited()
  }

  const syncRecommendationConfig = () => {
    const cfg = buildRecommendationConfig(storeConfig)
    recommendRecentCount = cfg.recentAnchorCount
    recommendTopCount = cfg.topAnchorCount
    recommendTopK = cfg.topK
    recommendMaxCandidates = cfg.maxCandidates
    recommendMaxParagraphs = cfg.maxParagraphs
    autoAlignRecommendationPriority = !!storeConfig?.autoAlignRecommendationPriority
  }

  const persistRecommendationConfig = async () => {
    storeConfig.recentAnchorCount = recommendRecentCount
    storeConfig.topAnchorCount = recommendTopCount
    storeConfig.recommendTopK = recommendTopK
    storeConfig.recommendMaxCandidates = recommendMaxCandidates
    storeConfig.recommendMaxParagraphs = recommendMaxParagraphs
    storeConfig.autoAlignRecommendationPriority = autoAlignRecommendationPriority
    await pluginInstance.saveData(storeName, storeConfig)
  }

  const onRecommendationConfigChange = async () => {
    recommendRecentCount = Number(recommendRecentCount) || 1
    recommendTopCount = Number(recommendTopCount) || 1
    recommendTopK = Number(recommendTopK) || 3
    recommendMaxCandidates = Number(recommendMaxCandidates) || 50
    recommendMaxParagraphs = Number(recommendMaxParagraphs) || 8
    await persistRecommendationConfig()
    await refreshRecommendations()
  }

  const refreshRecommendations = async () => {
    recommendLoading = true
    recommendError = ""
    try {
      const reviewer = await ensureReviewer()
      const service = ensureRecommendationService()
      const cfg = buildRecommendationConfig(storeConfig)
      cfg.recentAnchorCount = recommendRecentCount
      cfg.topAnchorCount = recommendTopCount
      cfg.topK = recommendTopK
      cfg.maxCandidates = recommendMaxCandidates
      cfg.maxParagraphs = recommendMaxParagraphs
      recommendations = await service.getRecommendations({
        reviewer,
        config: cfg
      })
      if (recommendations.length === 0) {
        recommendError = "暂无推荐，请先多漫游几篇文档"
      } else if (autoAlignRecommendationPriority && !aligningRecommendationPriority) {
        await alignRecommendationPriorities(true)
      }
    } catch (error: any) {
      pluginInstance.logger.error("刷新推荐失败", error)
      recommendError = error?.message || "推荐失败"
    } finally {
      recommendLoading = false
    }
  }

  const showPriorityAlignHelp = () => {
    alert(priorityAlignHelpText)
  }

  const alignRecommendationPriorities = async (silent = false) => {
    if (recommendations.length === 0) {
      showMessage("暂无推荐数据，无法对齐优先级", 3000, "info")
      return
    }

    aligningRecommendationPriority = true
    try {
      const reviewer = await ensureReviewer()
      const docIds = recommendations.map((item) => item.id)
      const priorityResults = await reviewer.batchGetDocumentPriorities(docIds)
      const priorityMap = new Map<string, number>()
      priorityResults.forEach((item) => priorityMap.set(item.docId, item.priority))

      const priorityValues = docIds.map((id) => priorityMap.get(id) ?? 5.0)
      if (priorityValues.length === 0) {
        showMessage("未获取到可对齐的优先级数据", 3000, "info")
        return
      }

      let minPriority = Math.min(...priorityValues)
      let maxPriority = Math.max(...priorityValues)
      if (!isFinite(minPriority) || !isFinite(maxPriority)) {
        showMessage("优先级数据异常，无法对齐", 3000, "error")
        return
      }

      const currentRange = maxPriority - minPriority
      if (currentRange < 3) {
        const expand = (3 - currentRange) / 2
        minPriority -= expand
        maxPriority += expand
      }
      const targetRange = maxPriority - minPriority

      const sortedByScore = [...recommendations].sort((a, b) => a.score - b.score)
      const minScore = sortedByScore[0].score
      const maxScore = sortedByScore[sortedByScore.length - 1].score
      const scoreRange = maxScore - minScore

      // 按相关性分布映射到扩展后的优先级区间，极值保持并拉伸到至少 3 的跨度
      const normalized = sortedByScore.map((item) => ({
        id: item.id,
        normalized: scoreRange === 0 ? 0.5 : (item.score - minScore) / scoreRange,
      }))

      const clamp = (v: number) => Math.max(0, Math.min(10, v))
      const targetPriorities = normalized.map(({ id, normalized }) => ({
        id,
        priority: clamp(minPriority + targetRange * normalized),
      }))

      const metrics = reviewer.getMetrics()
      const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0)
      const docPriorityDataList = await reviewer.batchGetDocPriorityData(docIds)
      const docPriorityMap = new Map(docPriorityDataList.map((d) => [d.docId, d]))

      for (const item of targetPriorities) {
        const docData = docPriorityMap.get(item.id)
        if (!docData) continue

        const oldPriority =
          totalWeight > 0
            ? metrics.reduce((sum, metric) => sum + (docData.metrics[metric.id] || 0) * metric.weight, 0) /
              totalWeight
            : 0

        const newMetrics = new Map<string, number>()
        if (oldPriority <= 0) {
          metrics.forEach((metric) => {
            const value = totalWeight > 0 ? item.priority * (metric.weight / totalWeight) : 0
            newMetrics.set(metric.id, clamp(value))
          })
        } else {
          const ratio = item.priority / oldPriority
          metrics.forEach((metric) => {
            const value = (docData.metrics[metric.id] || 0) * ratio
            newMetrics.set(metric.id, clamp(value))
          })
        }

        await Promise.all(
          metrics.map((metric) => reviewer.updateDocMetric(item.id, metric.id, newMetrics.get(metric.id) || 0))
        )
        await reviewer.updateDocPriority(item.id, item.priority)
      }

      await refreshPriorityBarPoints()
      if (currentTabKey === "priority") {
        await loadPriorityList()
      }
      if (currentRndId && docIds.includes(currentRndId)) {
        await refreshCurrentDocMetrics()
      }
      if (!silent) {
        showMessage("已根据推荐相关性对齐优先级", 3000, "info")
      }
    } catch (error: any) {
      pluginInstance.logger.error("推荐优先级对齐失败", error)
      showMessage("优先级对齐失败: " + (error?.message || error), 4000, "error")
    } finally {
      aligningRecommendationPriority = false
    }
  }

  const filterHistoryStoreKey = "sidebarFilterHistory"
  const generateHistoryId = () =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `fh-${Date.now()}-${Math.random().toString(16).slice(2)}`

  const normalizeHistoryState = (state: FilterHistoryState) => ({
    notebookIds: state.notebookIds ? [...state.notebookIds].sort() : undefined,
    rootId: state.rootId || "",
    rootDocTitle: state.rootDocTitle || "",
    tags: state.tags ? [...state.tags].sort() : undefined,
    sqlQuery: state.sqlQuery?.trim() || "",
  })

  const isSameHistoryEntry = (a: FilterHistoryItem, b: FilterHistoryItem) => {
    if (a.mode !== b.mode) return false
    const normalizedA = normalizeHistoryState(a.state || {})
    const normalizedB = normalizeHistoryState(b.state || {})
    return JSON.stringify(normalizedA) === JSON.stringify(normalizedB)
  }
  const getFilterModeLabel = (mode: FilterMode) => {
    switch (mode) {
      case FilterMode.Notebook:
        return "笔记本"
      case FilterMode.Root:
        return "根文档"
      case FilterMode.Tag:
        return "标签"
      case FilterMode.SQL:
        return "SQL 查询"
      default:
        return "筛选方式"
    }
  }

  const buildHistoryLabel = (mode: FilterMode, state: FilterHistoryState) => {
    switch (mode) {
      case FilterMode.Notebook: {
        if (!state.notebookIds || state.notebookIds.length === 0) {
          return "全部笔记本"
        }
        const names = state.notebookIds.map((id) => getNotebookName(id))
        return `笔记本：${names.join(" / ")}`
      }
      case FilterMode.Root:
        return `根文档：${state.rootDocTitle || state.rootId || "未选择"}`
      case FilterMode.Tag:
        return state.tags && state.tags.length > 0 ? `标签：${state.tags.join(", ")}` : "标签：未选择"
      case FilterMode.SQL: {
        const preview = (state.sqlQuery || "").trim()
        const shortPreview = preview.length > 40 ? `${preview.slice(0, 40)}...` : preview
        return preview ? `SQL：${shortPreview}` : "SQL：未填写"
      }
      default:
        return "筛选方式"
    }
  }

const sortHistory = (items: FilterHistoryItem[]) =>
    [...items].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (b.pinned && !a.pinned) return 1
      return b.timestamp - a.timestamp
    })

  const buildHistoryState = (mode: FilterMode): FilterHistoryState => {
    switch (mode) {
      case FilterMode.Notebook:
        return { notebookIds: [...selectedNotebooks] }
      case FilterMode.Root:
        return { rootId, rootDocTitle: selectedDocTitle || currentDocTitle }
      case FilterMode.Tag:
        return { tags: [...selectedTags] }
      case FilterMode.SQL:
        return { sqlQuery: sqlQuery.trim() }
      default:
        return {}
    }
  }

  const persistFilterHistory = async (items: FilterHistoryItem[]) => {
    filterHistory = sortHistory(items)
    if (storeConfig) {
      ;(storeConfig as any).filterHistory = filterHistory
      await pluginInstance.saveData(storeName, storeConfig)
    }
    await pluginInstance.saveData(filterHistoryStoreKey, filterHistory)
  }

  const loadFilterHistory = async () => {
    try {
      const saved = await pluginInstance.loadData(filterHistoryStoreKey)
      const legacy = (storeConfig as any)?.filterHistory
      const source = Array.isArray(saved) ? saved : Array.isArray(legacy) ? legacy : []
      filterHistory = sortHistory(source as FilterHistoryItem[])
      if (storeConfig) {
        ;(storeConfig as any).filterHistory = filterHistory
      }
    } catch (error) {
      pluginInstance.logger.warn("加载筛选历史失败", error)
      filterHistory = []
    }
  }


  const recordFilterHistory = async (mode: FilterMode) => {
    if (!storeConfig) return
    const state = buildHistoryState(mode)
    const label = buildHistoryLabel(mode, state)
    const newEntry: FilterHistoryItem = {
      id: generateHistoryId(),
      mode,
      label,
      state,
      pinned: false,
      timestamp: Date.now(),
    }
    const existingMatch = filterHistory.find((item) => isSameHistoryEntry(item, newEntry))
    const preservedPinned = existingMatch?.pinned ?? false
    const withoutMatch = filterHistory.filter((item) => !isSameHistoryEntry(item, newEntry))
    const updated = [{ ...newEntry, pinned: preservedPinned }, ...withoutMatch]
    const pinnedItems = updated.filter((item) => item.pinned)
    const unpinnedItems = updated.filter((item) => !item.pinned).slice(0, MAX_FILTER_HISTORY)
    await persistFilterHistory([...pinnedItems, ...unpinnedItems])
  }

  const togglePinHistory = async (id: string) => {
    if (!storeConfig) return
    const updated = filterHistory.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    await persistFilterHistory(updated)
  }

  const deleteHistoryEntry = async (id: string) => {
    const updated = filterHistory.filter((item) => item.id !== id)
    await persistFilterHistory(updated)
  }

  const applyFilterHistoryItem = async (item: FilterHistoryItem) => {
    if (!item) return
    filterMode = item.mode
    await onFilterModeChange(true)
    const state = item.state || {}
    if (item.mode === FilterMode.Notebook) {
      selectedNotebooks = [...(state.notebookIds ?? [])]
      await onNotebookChange()
    } else if (item.mode === FilterMode.Root && state.rootId) {
      await selectDocument(state.rootId, state.rootDocTitle || state.rootId)
    } else if (item.mode === FilterMode.Tag) {
      selectedTags = [...(state.tags ?? [])]
      await confirmTagSelection()
    } else if (item.mode === FilterMode.SQL) {
      sqlQuery = state.sqlQuery ?? ""
      await applySqlQuery()
    }
    showFilterHistory = false
  }

  const onFilterModeChange = async (skipHistory = false) => {
    storeConfig.filterMode = filterMode
    await pluginInstance.saveData(storeName, storeConfig)
    if (filterMode === FilterMode.Tag) {
      await loadAvailableTags()
    }
    if (filterMode === FilterMode.SQL) {
      sqlQuery = storeConfig.sqlQuery || ""
    }
    if (!skipHistory) {
      await recordFilterHistory(filterMode)
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
    await recordFilterHistory(FilterMode.Notebook)
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
    await recordFilterHistory(FilterMode.Tag)
  }

  const clearAllTags = async () => {
    selectedTags = []
    storeConfig.tags = []
    await pluginInstance.saveData(storeName, storeConfig)
    showTagDropdown = false
    pr = null
    await ensureReviewer()
    await recordFilterHistory(FilterMode.Tag)
  }

  const applySqlQuery = async () => {
    storeConfig.sqlQuery = sqlQuery || ""
    await pluginInstance.saveData(storeName, storeConfig)
    pr = null
    await ensureReviewer()
    await recordFilterHistory(FilterMode.SQL)
    showMessage("已应用 SQL 筛选条件", 2000, "info")
  }

  const copySqlExample = async (sql: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(sql)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = sql
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        textarea.remove()
      }
    showMessage("SQL 已复制", 2000, "info")
    } catch (error) {
      pluginInstance.logger.error("复制 SQL 失败", error)
      showMessage("复制失败，请手动复制", 2000, "error")
    }
  }

  const defaultSqlExamples: Array<{ title: string; sql: string }> = [
    { title: "基础文档查询", sql: "SELECT id FROM blocks WHERE type = 'd' AND content IS NOT NULL AND content != ''" },
    { title: "按内容关键词筛选", sql: "SELECT id FROM blocks WHERE type = 'd' AND content LIKE '%学习%'" },
    { title: "按创建时间筛选（最近7天）", sql: "SELECT id FROM blocks WHERE type = 'd' AND strftime('%Y-%m-%d', substr(created, 1, 4) || '-' || substr(created, 5, 2) || '-' || substr(created, 7, 2)) >= date('now', '-7 days')" },
    { title: "按最近更新时间排序取前50条", sql: "SELECT id FROM blocks WHERE type = 'd' ORDER BY updated DESC LIMIT 50" },
  ]

  const loadSqlExamples = async () => {
    try {
      const saved = await pluginInstance.loadData("sidebarSqlExamples")
      if (Array.isArray(saved) && saved.length > 0) {
        sqlExamples = saved as Array<{ title: string; sql: string }>
      } else {
        sqlExamples = [...defaultSqlExamples]
        await pluginInstance.saveData("sidebarSqlExamples", sqlExamples)
      }
    } catch (error) {
      pluginInstance.logger.warn("加载 SQL 示例失败，使用默认示例", error)
      sqlExamples = [...defaultSqlExamples]
    }
  }

  const addSqlExample = async () => {
    if (!newSqlTitle.trim() || !newSqlBody.trim()) {
      showMessage("请完善示例标题和SQL内容", 2000, "error")
      return
    }
    sqlExamples = [...sqlExamples, { title: newSqlTitle.trim(), sql: newSqlBody.trim() }]
    newSqlTitle = ""
    newSqlBody = ""
    await pluginInstance.saveData("sidebarSqlExamples", sqlExamples)
    showMessage("已添加示例", 2000, "info")
  }

  const removeSqlExample = async (index: number) => {
    sqlExamples = sqlExamples.filter((_, i) => i !== index)
    await pluginInstance.saveData("sidebarSqlExamples", sqlExamples)
    showMessage("已删除示例", 2000, "info")
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
    pr = null
    await ensureReviewer()
    await recordFilterHistory(FilterMode.Root)
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

  const handleDragStart = (e: DragEvent, item: { id: string; priority: number }, index: number) => {
    draggedItem = item
    draggedIndex = index
    dragOverIndex = -1
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move"
      e.dataTransfer.setData("text/plain", item.id)
    }
  }

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    dragOverIndex = index
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    dragOverIndex = -1
  }

  const handleDrop = async (e: DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedIndex === -1 || draggedIndex === dropIndex) {
      draggedItem = null
      draggedIndex = -1
      dragOverIndex = -1
      return
    }

    try {
      const working = [...priorityList]
      const [item] = working.splice(draggedIndex, 1)
      working.splice(dropIndex, 0, item)

      let newPriority = item.priority
      if (dropIndex === 0 && working.length > 1) {
        newPriority = working[1].priority + 1
      } else if (dropIndex === working.length - 1 && working.length > 1) {
        newPriority = working[working.length - 2].priority - 1
      } else if (working.length > 2) {
        const upper = working[dropIndex - 1]?.priority ?? 5
        const lower = working[dropIndex + 1]?.priority ?? 5
        newPriority = (upper + lower) / 2
      }
      newPriority = parseFloat(Math.max(0, Math.min(10, newPriority)).toFixed(2))

      await handlePriorityInputInList(item.id, newPriority)
    } finally {
      draggedItem = null
      draggedIndex = -1
      dragOverIndex = -1
    }
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
      await openDoc(docId)
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

  const loadRoamingCountList = async () => {
    roamingCountLoading = true
    try {
      const reviewer = await ensureReviewer()
      const docs = await reviewer.getRoamingCountList(storeConfig)
      roamingCountList = docs.sort((a, b) => b.roamingCount - a.roamingCount)
    } catch (error) {
      pluginInstance.logger.error("Failed to load roaming count list", error)
      roamingCountList = []
    } finally {
      roamingCountLoading = false
    }
  }

  const resetRoamingCountForDoc = async (docId: string) => {
    try {
      const reviewer = await ensureReviewer()
      await reviewer.resetRoamingCount(docId)
      roamingCountList = roamingCountList
        .map((item) => (item.id === docId ? { ...item, roamingCount: 0 } : item))
        .sort((a, b) => b.roamingCount - a.roamingCount)
      showMessage("Roaming count reset to 0", 2000, "info")
    } catch (error: any) {
      pluginInstance.logger.error("Reset roaming count failed", error)
      showMessage("Reset failed: " + (error?.message || error), 3000, "error")
    }
  }

  const resetVisitedAndRefresh = async () => {
    await resetAllVisitCounts()
    if (currentTabKey === "visited") {
      await loadVisitedDocs()
    }
  }

  const openDoc = (docId: string) => {
    if (pluginInstance.isMobile) {
      return openMobileFileById(pluginInstance.app, docId, [])
    }
    return openTab({ app: pluginInstance.app, doc: { id: docId } })
  }

  const openRecommendationDoc = async (docId: string) => {
    try {
      const reviewer = await ensureReviewer()
      currentRndId = docId
      if (storeConfig) {
        ;(storeConfig as any).currentRndId = docId
        await pluginInstance.saveData(storeName, storeConfig)
      }
      await refreshCurrentDocMetrics()
      await reviewer.recordVisitAndRoam(docId)
      await refreshPriorityBarPoints()
      if (currentTabKey === "priority") {
        await loadPriorityList()
      }
      if (currentTabKey === "visited") {
        await loadVisitedDocs()
      }
      if (currentTabKey === "roamingCount") {
        await loadRoamingCountList()
      }
      await openDoc(docId)
    } catch (error: any) {
      pluginInstance.logger.error("打开推荐文档失败", error)
      showMessage("打开推荐文档失败: " + (error?.message || error), 3000, "error")
    }
  }

  const doIncrementalRandomDoc = async () => {
    storeConfig = await pluginInstance.safeLoad(storeName)
    syncRecommendationConfig()
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
      if (currentTabKey === "priority") {
        await loadPriorityList()
      }
      if (currentTabKey === "visited") {
        await loadVisitedDocs()
      }
      if (currentTabKey === "roamingCount") {
        await loadRoamingCountList()
      }
      await refreshRecommendations()

      await openDoc(currentRndId)
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
    if (storeConfig.autoAlignRecommendationPriority === undefined) {
      storeConfig.autoAlignRecommendationPriority = false
      await pluginInstance.saveData(storeName, storeConfig)
    }
    syncRecommendationConfig()

    filterHistory = sortHistory((storeConfig as any).filterHistory ?? [])
    storeConfig.filterHistory = filterHistory

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
    sqlQuery = storeConfig.sqlQuery ?? ""

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
    await loadFilterHistory()
    await loadSqlExamples()
    await refreshRecommendations()
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

  <div class="tab-bar" style={`grid-template-columns: repeat(${tabs.length}, 1fr);`}>
    {#each tabs as tab, index}
      <button class:selected={activeTab === index} on:click={() => switchTab(index)}>{tab.label}</button>
    {/each}
  </div>

  <div class="tab-panels">
    {#if currentTabKey === "filters"}
      <div class="tip-banner">
        <div class="tip-icon">✨</div>
      <div class="tip-text">{probabilityTip}</div>
    </div>

    <div class="section filter-section">
      <div class="section-header">
        <div class="section-title filter-section-title">筛选文档</div>
        <div class="section-actions">
          <button class="history-button" on:click={() => (showFilterHistory = !showFilterHistory)}>筛选历史</button>
        </div>
        {#if showFilterHistory}
          <div class="filter-history-panel">
              {#if filterHistory.length === 0}
                <div class="empty-message">暂无筛选历史</div>
              {:else}
                {#each filterHistory as item (item.id)}
                  <div class="history-item">
                    <div class="history-main">
                      <button class="history-apply" on:click={() => applyFilterHistoryItem(item)}>
                        <span class="history-mode">{getFilterModeLabel(item.mode)}</span>
                        <span class="history-label">{item.label}</span>
                      </button>
                      <div class="history-actions">
                        <button
                          class="history-pin"
                          class:active-pin={item.pinned}
                          title={item.pinned ? "取消钉住" : "钉住记录"}
                          on:click={() => togglePinHistory(item.id)}
                        >
                          {item.pinned ? "📌" : "📍"}
                        </button>
                        <button
                          class="history-delete"
                          title="删除记录"
                          on:click={() => deleteHistoryEntry(item.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>

        <div class="filter-row filter-main-row">
          <div class="filter-mode-block">
            <select bind:value={filterMode} class="filter-select" on:change={onFilterModeChange}>
              <option value={FilterMode.Notebook}>笔记本</option>
              <option value={FilterMode.Root}>根文档</option>
              <option value={FilterMode.Tag}>标签</option>
              <option value={FilterMode.SQL}>SQL 查询</option>
            </select>
          </div>

          <div class="filter-content-block">
            {#if filterMode === FilterMode.Notebook}
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
            {:else if filterMode === FilterMode.Root}
              <button class="filter-button" on:click={startDocumentSelection}>{currentDocTitle}</button>
            {:else if filterMode === FilterMode.Tag}
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
            {:else if filterMode === FilterMode.SQL}
              <div class="sql-filter-wrapper">
                <label class="filter-label" for="sql-input">SQL 查询</label>
                <textarea
                  id="sql-input"
                  class="filter-sql"
                  bind:value={sqlQuery}
                  rows="4"
                  placeholder="例如：SELECT id FROM blocks WHERE type = 'd' AND content IS NOT NULL AND content != ''"
                ></textarea>
                <div class="toolbar-row">
                  <button class="secondary-button" on:click={applySqlQuery}>应用筛选</button>
                  <button class="secondary-button" on:click={() => (showSqlExamples = !showSqlExamples)}>
                    {showSqlExamples ? "收起语句库" : "查看语句库"}
                  </button>
                </div>
                {#if showSqlExamples}
                  <div class="sql-examples-block">
                    <div class="sql-example-tip">
                      <strong>💡 使用提示：</strong>
                      <ul>
                        <li>确保SQL返回的字段名是 <code>id</code>（文档ID）</li>
                        <li>可以组合多个条件创建复杂的筛选逻辑</li>
                        <li>点击 📋 按钮可快速复制SQL语句到剪贴板</li>
                      </ul>
                    </div>
                    {#each sqlExamples as example, idx}
                      <div class="sql-example-item">
                        <div class="sql-example-header">
                          <strong>{example.title}</strong>
                          <div class="sql-example-actions">
                            <button class="copy-btn" title="??" on:click={() => copySqlExample(example.sql)}>??</button>
                            <button class="copy-btn danger" title="??" on:click={() => removeSqlExample(idx)}>??</button>
                          </div>
                        </div>
                        <code>{example.sql}</code>
                      </div>
                    {/each}
                    <div class="sql-example-add">
                      <input
                        class="b3-text-field"
                        placeholder="?SQL??"
                        bind:value={newSqlTitle}
                      />
                      <textarea
                        class="filter-sql"
                        placeholder="?SQL??"
                        rows="2"
                        bind:value={newSqlBody}
                      ></textarea>
                      <button class="secondary-button" on:click={addSqlExample}>??????</button>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="section">
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
      </div>

      <div class="section recommendation-section">
        <div class="toolbar-row recommendation-toolbar">
          <h4 class="recommendation-heading">智能推荐</h4>
          {#if !autoAlignRecommendationPriority}
            <div class="align-actions">
              <button
                class="secondary-button recommend-action-button align-btn"
                on:click={() => alignRecommendationPriorities()}
                disabled={recommendLoading || aligningRecommendationPriority || recommendations.length === 0}
              >
                {aligningRecommendationPriority ? "对齐中..." : "优先级对齐"}
              </button>
              <button
                class="secondary-button recommend-action-button help-btn"
                on:click={showPriorityAlignHelp}
                title="优先级对齐说明"
              >
                ?
              </button>
            </div>
          {/if}
          <button
            class="secondary-button recommend-action-button refresh-btn"
            on:click={refreshRecommendations}
            disabled={recommendLoading}
          >
            {recommendLoading ? "生成中..." : "刷新推荐"}
          </button>
        </div>
        {#if recommendLoading}
          <div class="placeholder">正在计算相似文档...</div>
        {:else if recommendations.length === 0}
          <div class="placeholder">{recommendError || "暂无推荐，请多漫游几篇试试"}</div>
        {:else}
          <ul class="recommend-list">
            {#each recommendations as item}
              <li>
                <div class="recommend-main">
                  <span
                    class="recommend-title"
                    role="button"
                    tabindex="0"
                    on:click={() => openRecommendationDoc(item.id)}
                    on:keydown={(e) => e.key === "Enter" && openRecommendationDoc(item.id)}
                  >
                    {item.title}
                  </span>
                  <span class="recommend-score">{(item.score * 100).toFixed(1)}%</span>
                </div>
                <div class="recommend-sub">
                  <span>基准 {item.anchors.length} 篇</span>
                  <span class="recommend-id">{item.id.slice(0, 6)}...</span>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {:else if currentTabKey === "chart"}
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
    {:else if currentTabKey === "priority"}
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
            {#each priorityList as doc, index}
              <li
                draggable="true"
                class:dragging={draggedIndex === index}
                class:drag-over={dragOverIndex === index}
                on:dragstart={(e) => handleDragStart(e, doc, index)}
                on:dragover={(e) => handleDragOver(e, index)}
                on:dragleave={handleDragLeave}
                on:drop={(e) => handleDrop(e, index)}
              >
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
    {:else if currentTabKey === "visited"}
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
    {:else if currentTabKey === "roamingCount"}
      <div class="section">
        <div class="section-title">漫游次数排序表</div>
        <div class="toolbar-row">
          <button class="secondary-button" on:click={loadRoamingCountList} disabled={roamingCountLoading}>
            {roamingCountLoading ? "加载中..." : "刷新列表"}
          </button>
        </div>
        {#if roamingCountLoading}
          <div class="placeholder">正在加载漫游次数...</div>
        {:else if roamingCountList.length === 0}
          <div class="placeholder">暂无漫游次数数据</div>
        {:else}
          <ul class="roaming-count-list">
            {#each roamingCountList as doc}
              <li>
                <div class="roaming-row">
                  <div class="roaming-main">
                    <span
                      class="roaming-title"
                      role="button"
                      tabindex="0"
                      on:click={() => openDoc(doc.id)}
                      on:keydown={(e) => e.key === "Enter" && openDoc(doc.id)}
                    >{doc.title}</span>
                    <span class="roaming-id">{doc.id.slice(0, 6)}...</span>
                  </div>
                  <div class="roaming-actions">
                    <span class="roaming-count">漫游 {doc.roamingCount} 次</span>
                    <button class="secondary-button danger" on:click={() => resetRoamingCountForDoc(doc.id)}>清0</button>
                  </div>
                </div>
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
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
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
    color: var(--b3-theme-on-surface);
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
  }

  .tab-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    border-bottom: 1px solid var(--b3-theme-border);
    flex-shrink: 0;
  }

  .tab-bar button {
    background: var(--b3-theme-surface);
    border: none;
    padding: 10px 0;
    cursor: pointer;
    font-size: 13px;
    border-right: 1px solid var(--b3-theme-border);
    color: var(--b3-theme-on-surface);
  }

  .tab-bar button:last-child {
    border-right: none;
  }

  .tab-bar button.selected {
    color: var(--b3-theme-on-primary);
    font-weight: 600;
    background: var(--b3-theme-primary);
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
  .filter-section {
    border: 1px solid var(--b3-theme-primary-lightest, var(--b3-theme-border));
    background: linear-gradient(180deg, var(--b3-theme-background) 0%, var(--b3-theme-surface) 100%);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: visible;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .section-header .section-title {
    margin: 0;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-row {
    position: relative;
    border: 1px solid var(--b3-theme-border);
    border-radius: 8px;
    padding: 10px 12px;
    background: var(--b3-theme-surface);
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .filter-main-row {
    margin-bottom: 0;
  }

  .filter-label {
    font-size: 13px;
    margin-right: 8px;
    color: var(--b3-theme-on-surface);
  }

  .filter-mode-block {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .filter-content-block {
    min-width: 0;
    width: 100%;
  }

  .filter-content-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .filter-select {
    width: auto;
    min-width: 108px;
    max-width: 132px;
    padding: 6px 8px;
    font-size: 13px;
    border: 1px solid var(--b3-theme-primary-lightest, var(--b3-theme-border));
    border-radius: 6px;
    background: var(--b3-theme-background);
    color: var(--b3-theme-on-surface);
  }
  @media (max-width: 900px) {
    .filter-select {
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
  }

  .filter-section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--b3-theme-on-surface);
  }

  .history-button {
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-background);
    color: var(--b3-theme-on-surface);
    border-radius: 6px;
    padding: 6px 10px;
    cursor: pointer;
    font-size: 12px;
  }

  .history-button:hover {
    border-color: var(--b3-theme-primary);
    color: var(--b3-theme-primary);
  }

  .filter-history-panel {
    position: absolute;
    top: 46px;
    right: 10px;
    width: min(420px, 100%);
    max-height: 320px;
    overflow-y: auto;
    background: var(--b3-theme-background);
    border: 1px solid var(--b3-theme-border);
    border-radius: 10px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 15;
  }

  .history-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 8px;
    background: var(--b3-theme-surface);
  }

  .history-main {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .history-apply {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--b3-theme-on-surface);
    text-align: left;
  }

  .history-actions {
    display: flex;
    gap: 6px;
    align-items: center;
    white-space: nowrap;
  }

  .history-mode {
    font-size: 12px;
    padding: 2px 8px;
    background: var(--b3-theme-primary-lightest, var(--b3-theme-background));
    border-radius: 999px;
    color: var(--b3-theme-on-surface);
  }

  .history-label {
    font-size: 13px;
    color: var(--b3-theme-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .history-pin {
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-background);
    color: var(--b3-theme-on-surface);
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    min-width: 40px;
  }

  .history-delete {
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-background);
    color: var(--b3-theme-error);
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    min-width: 40px;
  }

  .history-pin.active-pin {
    border-color: var(--b3-theme-primary);
    color: var(--b3-theme-primary);
    background: var(--b3-theme-primary-lightest, var(--b3-theme-background));
  }

  .sql-filter-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-sql {
    width: 100%;
    box-sizing: border-box;
    margin-top: 4px;
    padding: 8px 10px;
    font-size: 13px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    resize: vertical;
  }

  .sql-examples-block {
    margin-top: 8px;
    padding: 8px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    background: var(--b3-theme-surface);
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: var(--b3-theme-on-surface);
  }

  .sql-example-item {
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    padding: 8px;
    background: var(--b3-theme-background);
  }

  .sql-example-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    font-size: 13px;
  }

  .sql-example-actions {
    display: flex;
    gap: 6px;
  }

  .sql-example-item code {
    display: block;
    background: var(--b3-theme-surface);
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    padding: 6px;
    font-family: monospace;
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    white-space: pre-wrap;
    word-break: break-all;
  }

  .copy-btn {
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
  }

  .copy-btn.danger {
    color: var(--b3-theme-error);
  }

  .sql-example-tip {
    font-size: 12px;
    color: var(--b3-theme-on-surface);
  }

  .sql-example-tip ul {
    padding-left: 16px;
    margin: 4px 0 0 0;
  }

  .sql-example-add {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
  }

  .selector-wrapper {
    position: relative;
  }

  .filter-button {
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    color: var(--b3-theme-on-surface);
    border: 1px solid var(--b3-theme-primary-lightest, var(--b3-theme-border));
    background: linear-gradient(180deg, var(--b3-theme-background) 0%, var(--b3-theme-surface) 100%);
    border-radius: 6px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .filter-button:hover {
    border-color: var(--b3-theme-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    background: var(--b3-theme-surface);
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--b3-theme-background);
    border: 1px solid var(--b3-theme-primary-lightest, var(--b3-theme-border));
    border-radius: 8px;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
    z-index: 10;
    max-height: 240px;
    overflow-y: auto;
    color: var(--b3-theme-on-surface);
    display: flex;
    flex-direction: column;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 13px;
    gap: 8px;
    color: var(--b3-theme-on-surface);
  }

  .dropdown-item:hover {
    background: var(--b3-theme-hover);
  }

  .confirm-buttons {
    position: sticky;
    bottom: 0;
    display: flex;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid var(--b3-theme-border);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0), var(--b3-theme-surface));
    margin-top: auto;
  }

  .confirm-btn {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--b3-theme-border);
    background: var(--b3-theme-background);
    border-radius: 4px;
    cursor: pointer;
    color: var(--b3-theme-on-surface);
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

  .secondary-button {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
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
    align-items: center;
  }

  .recommendation-toolbar {
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .align-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .recommendation-heading {
    margin: 0;
    font-size: 14px;
    color: var(--b3-theme-on-surface);
    font-weight: 600;
    flex: 1 1 auto;
  }

  .recommend-action-button {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--b3-theme-primary) 60%, transparent);
    color: var(--b3-theme-primary);
    font-weight: 600;
    letter-spacing: 0.3px;
    min-height: 40px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--b3-theme-primary) 18%, transparent);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, color 0.2s ease, background 0.2s ease;
    background: var(--b3-theme-primary-lightest, var(--b3-theme-surface));
    border-radius: 8px;
  }

  .recommend-action-button.align-btn {
    background: var(--b3-theme-primary-lightest, var(--b3-theme-surface));
    border-color: var(--b3-theme-primary);
  }

  .recommend-action-button.help-btn {
    width: 36px;
    min-width: 36px;
    padding: 0;
    font-weight: 700;
    background: var(--b3-theme-surface);
  }

  .recommend-action-button.refresh-btn {
    background: var(--b3-theme-primary-lighter, var(--b3-theme-primary-lightest, var(--b3-theme-surface)));
    border-color: var(--b3-theme-primary-light, var(--b3-theme-primary));
  }

  .recommend-action-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px color-mix(in srgb, var(--b3-theme-primary) 28%, transparent);
    background: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary, #fff);
  }

  .recommend-action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    color: var(--b3-theme-on-surface-light);
    background: var(--b3-theme-surface);
  }

  .recommend-action-button:focus-visible {
    outline: 2px solid var(--b3-theme-primary);
    outline-offset: 2px;
  }

  .priority-list,
  .visited-list,
  .roaming-count-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--b3-theme-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--b3-theme-surface);
  }

  .priority-list li,
  .visited-list li,
  .roaming-count-list li {
    border: none;
    border-bottom: 1px solid var(--b3-theme-border);
    padding: 10px 12px;
    background: var(--b3-theme-surface);
  }

  .priority-list li:last-child,
  .visited-list li:last-child,
  .roaming-count-list li:last-child {
    border-bottom: none;
  }

  .priority-list li.dragging {
    opacity: 0.85;
    background: var(--b3-theme-hover);
  }

  .priority-list li.drag-over {
    box-shadow: inset 0 0 0 1px var(--b3-theme-primary);
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

  .roaming-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .roaming-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .roaming-title {
    color: var(--b3-theme-primary);
    cursor: pointer;
  }

  .roaming-id {
    color: var(--b3-theme-on-surface);
    opacity: 0.7;
    font-size: 12px;
  }

  .roaming-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .roaming-count {
    font-weight: 600;
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

  .recommendation-section {
    margin-top: 8px;
  }

  .recommend-config {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 8px;
  }

  .recommend-config label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--b3-theme-on-surface);
  }

  .recommend-config input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 6px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
  }

  .recommend-list {
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1px solid var(--b3-theme-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--b3-theme-surface);
  }

  .recommend-list li {
    padding: 10px 12px;
    border-bottom: 1px solid var(--b3-theme-border);
  }

  .recommend-list li:last-child {
    border-bottom: none;
  }

  .recommend-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .recommend-title {
    color: var(--b3-theme-primary);
    cursor: pointer;
    font-weight: 600;
  }

  .recommend-score {
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    opacity: 0.8;
  }

  .recommend-sub {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    opacity: 0.85;
  }

  .recommend-id {
    font-family: monospace;
  }
</style>
