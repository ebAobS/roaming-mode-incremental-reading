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
  import { onMount } from "svelte"
  import RandomDocPlugin from "../index"
  import { showMessage, openTab } from "siyuan"
  import { storeName } from "../Constants"
  import RandomDocConfig, { FilterMode, ReviewMode } from "../models/RandomDocConfig"
  import IncrementalReviewer from "../service/IncrementalReviewer"
  import { showSettingMenu } from "../topbar"
  import { icons } from "../utils/svg"
  import MetricsPanel from "./MetricsPanel.svelte"
  import type { Metric } from "../models/IncrementalConfig"

  // props
  export let pluginInstance: RandomDocPlugin

  // 变量
  let isLoading = false
  let storeConfig: RandomDocConfig
  let notebooks = []
  let selectedNotebooks: string[] = []
  let showNotebookSelector = false
  let filterMode = FilterMode.Notebook
  let rootId = ""
  let selectedDocTitle = ""
  
  // 标签筛选相关变量
  let selectedTags: string[] = []
  let availableTags: string[] = []
  let isTagsLoading = false
  let showTagDropdown = false
  
  // 根文档选择器相关变量
  let isDocsLoading = false
  let showDocSelector = false
  let currentLevel = "notebooks"
  let selectedNotebookForDoc = null
  let rootDocsList: any[] = []
  let childDocsList: any[] = []
  let docNavigationStack: any[] = []
  let showManualInput = false
  let manualInputId = ""

  let pr: IncrementalReviewer

  // 已访问文档列表弹窗相关
  let showVisitedDialog = false
  let visitedDocs: Array<{id: string, content: string, lastTime?: string}> = []
  let visitedLoading = false

  // 文档指标相关
  let currentRndId: string | undefined = undefined
  let docMetrics: Metric[] = []
  let docPriority: { [key: string]: number } = {}
  let metricsLoading = false

  // 响应式计算当前选中文档的标题
  $: currentDocTitle = (() => {
    if (!rootId) {
      return "请选择文档"
    }
    if (selectedDocTitle) {
      return selectedDocTitle
    }
    const doc = rootDocsList.find(d => d.id === rootId)
    if (doc && doc.title) {
      return doc.title
    }
    return rootId.substring(0, 8) + "..."
  })()

  // 重置所有访问记录
  async function resetAllVisitCounts() {
    try {
      if (!pr) {
        pr = new IncrementalReviewer(storeConfig, pluginInstance)
        await pr.initIncrementalConfig()
      }
      await pr.resetVisited()
    } catch (error) {
      pluginInstance.logger.error("重置访问记录失败", error)
      showMessage(`重置失败: ${error.message}`, 5000, "error")
      throw error
    }
  }

  // 继续漫游功能 - 独立实现，不依赖主界面
  const doIncrementalRandomDoc = async () => {
    // 每次漫游前强制刷新配置，确保概率配置为最新
    storeConfig = await pluginInstance.safeLoad(storeName)
    
    // SQL筛选模式下如果没有SQL查询语句，不执行漫游
    if (storeConfig.filterMode === FilterMode.SQL && (!storeConfig.sqlQuery || storeConfig.sqlQuery.trim() === '')) {
      showMessage("请输入SQL查询语句", 3000, "info")
      isLoading = false
      return
    }
    
    isLoading = true
    let result = undefined
    
    // 保存旧的文档ID，用于在加载过程中保持显示
    const oldDocId = currentRndId
    
    // 清除保存的文档ID（但不立即清空 currentRndId，保持UI连续性）
    if (storeConfig) {
      (storeConfig as any).currentRndId = undefined
      await pluginInstance.saveData(storeName, storeConfig)
    }

    try {
      // 每次漫游都重新创建IncrementalReviewer实例，确保使用最新配置
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
      
      // 获取文档总数
      let total
      try {
        total = await pr.getTotalDocCount(storeConfig)
      } catch (error) {
        pluginInstance.logger.error("获取文档总数失败:", error)
        showMessage("SQL筛选执行失败，请检查SQL语句语法或网络连接后重试", 3000, "error")
        isLoading = false
        return
      }
      
      if (total === 0) {
        if (storeConfig.filterMode === FilterMode.SQL) {
          showMessage("SQL筛选结果为空，请调整查询条件后重新应用筛选", 3000, "info")
        } else {
          showMessage("没有找到符合条件的文档，请先创建并填充一些文档", 3000, "info")
        }
        isLoading = false
        return
      }

      // 获取随机文档
      try {
        result = await pr.getRandomDoc(storeConfig)
        let newDocId, isAbsolutePriority = false
        if (typeof result === 'object' && result !== null && 'docId' in result) {
          newDocId = result.docId
          isAbsolutePriority = result.isAbsolutePriority
        } else {
          newDocId = result
        }
        if (!newDocId) {
          pluginInstance.logger.info("没有找到符合条件的文档，可能一轮漫游已完成，自动开始新一轮...")
          try {
            // 重置访问记录
            await resetAllVisitCounts()
            showMessage("已完成一轮漫游！已自动重置访问记录，开始新一轮漫游...", 2000, "info")
            
            // 短暂延迟后重新开始漫游
            setTimeout(async () => {
              try {
                await doIncrementalRandomDoc()
              } catch (retryError) {
                pluginInstance.logger.error("重新开始漫游失败:", retryError)
                showMessage(`重新开始漫游失败: ${retryError.message}`, 3000, "error")
                isLoading = false
              }
            }, 1000)
            return
          } catch (resetError) {
            pluginInstance.logger.error("自动重置访问记录失败:", resetError)
            showMessage("检测到一轮漫游完成，但自动重置失败，请手动重置访问记录后继续", 3000, "error")
            isLoading = false
            return
          }
        }
        
        // 设置当前文档ID
        currentRndId = newDocId
      } catch (error) {
        pluginInstance.logger.error("获取随机文档失败:", error)
        
        // 检查是否是因为所有文档都已访问过而导致的错误
        if (error.message.includes("所有文档都已访问过") || error.message.includes("没有找到符合条件的文档")) {
          pluginInstance.logger.info("检测到所有文档都已访问，自动开始新一轮...")
          try {
            // 重置访问记录
            await resetAllVisitCounts()
            showMessage("所有文档都已访问过，已自动重置访问记录，开始新一轮漫游...", 2000, "info")
            
            // 短暂延迟后重新开始漫游
            setTimeout(async () => {
              try {
                await doIncrementalRandomDoc()
              } catch (retryError) {
                pluginInstance.logger.error("重新开始漫游失败:", retryError)
                showMessage(`重新开始漫游失败: ${retryError.message}`, 3000, "error")
                isLoading = false
              }
            }, 1000)
            return
          } catch (resetError) {
            pluginInstance.logger.error("自动重置访问记录失败:", resetError)
            showMessage("检测到一轮漫游完成，但自动重置失败，请手动重置访问记录后继续", 3000, "error")
            isLoading = false
            return
          }
        }
        
        // 其他类型的错误，直接显示错误信息
        showMessage(`获取随机文档失败: ${error.message}`, 3000, "error")
        isLoading = false
        return
      }
      
      pluginInstance.logger.info(`已漫游到文档: ${currentRndId}`)
      
      // 验证文档是否存在
      try {
        const blockResult = await pluginInstance.kernelApi.getBlockByID(currentRndId)
        if (!blockResult) {
          showMessage("获取文档块信息失败，或许文档已被删除", 3000, "error")
          currentRndId = undefined
          isLoading = false
          return
        }
      } catch (error) {
        pluginInstance.logger.error("获取文档内容时出错:", error)
        showMessage("获取文档内容时出错: " + error.message, 3000, "error")
        isLoading = false
        return
      }
      
      // 清空旧的文档指标数据（在新文档加载成功后）
      if (oldDocId && oldDocId !== currentRndId) {
        docPriority = {}
        docMetrics = []
      }
      
      // 加载文档指标数据
      await refreshCurrentDocMetrics()
      
      // 保存当前文档ID到配置中，以便插件重新加载后能恢复
      if (storeConfig) {
        (storeConfig as any).currentRndId = currentRndId
        await pluginInstance.saveData(storeName, storeConfig)
        pluginInstance.logger.info(`已保存当前文档ID到配置: ${currentRndId}`)
      }
      
      // 增加文档的漫游次数
      try {
        await pr.incrementRoamingCount(currentRndId)
      } catch (error) {
        pluginInstance.logger.error("增加漫游次数失败:", error)
        // 不影响主要功能，只记录错误
      }
      
      // 打开文档到新标签页
      try {
        openTab({
          app: pluginInstance.app,
          doc: { id: currentRndId }
        })
      } catch (error) {
        pluginInstance.logger.error("打开文档失败:", error)
        // 不影响主要功能，只记录错误
      }
      
    } catch (e) {
      pluginInstance.logger.error("渐进复习出错:", e)
      showMessage("渐进复习出错: " + (e.message || e), 3000, "error")
      // 如果出错，清空文档ID和指标数据
      currentRndId = undefined
      docPriority = {}
      docMetrics = []
    } finally {
      isLoading = false
    }
  }

  // 刷新当前文档的指标数据 - 使用侧边栏自己的 currentRndId
  async function refreshCurrentDocMetrics() {
    if (!currentRndId) {
      docPriority = {}
      docMetrics = []
      return
    }

    metricsLoading = true

    try {
      if (!pr) {
        pr = new IncrementalReviewer(storeConfig, pluginInstance)
        await pr.initIncrementalConfig()
      }

      // 保存当前处理的文档ID，用于后续校验
      const processingDocId = currentRndId

      // 获取文档的优先级数据
      const docPriorityData = await pr.getDocPriorityData(processingDocId)
      
      // 检查文档ID是否已经改变
      if (processingDocId !== currentRndId) {
        pluginInstance.logger.warn(`文档ID已改变，放弃处理 ${processingDocId} 的优先级数据`)
        return
      }
      
      docPriority = docPriorityData.metrics

      // 获取指标配置
      docMetrics = pr.getMetrics()

      if (!docMetrics || docMetrics.length === 0) {
        pluginInstance.logger.error("无法获取指标配置，尝试重新初始化...")
        await pr.initIncrementalConfig()
        docMetrics = pr.getMetrics()

        if (!docMetrics || docMetrics.length === 0) {
          pluginInstance.logger.error("重新初始化后仍无法获取指标配置")
          docMetrics = []
          docPriority = {}
        }
      }
    } catch (error) {
      pluginInstance.logger.error("获取文档指标数据失败:", error)
      docMetrics = []
      docPriority = {}
    } finally {
      metricsLoading = false
    }
  }

  // 处理 MetricsPanel 的优先级变化事件
  async function handleMetricsPanelPriorityChange(e: CustomEvent) {
    // 优先级变化时的处理逻辑
    pluginInstance.logger.info("文档优先级已更新:", e.detail.priority)
  }

  // 筛选模式变更
  const onFilterModeChange = async function () {
    storeConfig.filterMode = filterMode
    await pluginInstance.saveData(storeName, storeConfig)
    
    if (filterMode === FilterMode.Tag) {
      try {
        await loadAvailableTags()
      } catch (error) {
        pluginInstance.logger.error("自动加载标签失败:", error)
      }
    }
    
    if (storeConfig.reviewMode === "incremental") {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
    
    pluginInstance.logger.info("storeConfig saved filterMode =>", storeConfig)
  }

  // 笔记本选择相关
  const toggleNotebook = (notebookId: string) => {
    if (selectedNotebooks.includes(notebookId)) {
      selectedNotebooks = selectedNotebooks.filter(id => id !== notebookId)
    } else {
      selectedNotebooks = [...selectedNotebooks, notebookId]
    }
  }

  const getNotebookName = (notebookId: string) => {
    const notebook = notebooks.find(n => n.id === notebookId)
    return notebook ? notebook.name : '未知笔记本'
  }

  const onNotebookChange = async function () {
    storeConfig.notebookId = selectedNotebooks.join(',')
    await pluginInstance.saveData(storeName, storeConfig)
    
    if (storeConfig.reviewMode === "incremental") {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
    
    pluginInstance.logger.info("storeConfig saved notebookIds =>", selectedNotebooks)
  }

  // 标签相关
  const loadAvailableTags = async function () {
    if (isTagsLoading) return
    isTagsLoading = true
    try {
      if (!pr) {
        pr = new IncrementalReviewer(storeConfig, pluginInstance)
        await pr.initIncrementalConfig()
      }
      availableTags = await pr.getAllAvailableTags()
    } catch (error) {
      pluginInstance.logger.error("加载可用标签失败:", error)
      availableTags = []
    } finally {
      isTagsLoading = false
    }
  }

  const toggleTag = (tag: string) => {
    const index = selectedTags.indexOf(tag)
    if (index > -1) {
      selectedTags = selectedTags.filter(t => t !== tag)
    } else {
      selectedTags = [...selectedTags, tag]
    }
  }

  const confirmTagSelection = async function () {
    storeConfig.tags = selectedTags
    await pluginInstance.saveData(storeName, storeConfig)
    
    if (storeConfig.reviewMode === "incremental") {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
    
    showTagDropdown = false
    pluginInstance.logger.info("storeConfig saved tags =>", storeConfig)
  }

  const clearAllTags = async function () {
    selectedTags = []
    storeConfig.tags = []
    await pluginInstance.saveData(storeName, storeConfig)
    showTagDropdown = false
    
    if (storeConfig.reviewMode === "incremental") {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
  }

  // 根文档选择器相关
  const startDocumentSelection = async function () {
    if (isDocsLoading) return
    showDocSelector = true
    currentLevel = "notebooks"
    selectedNotebookForDoc = null
    rootDocsList = []
    childDocsList = []
    docNavigationStack = []
  }

  const selectNotebookForDoc = async function (notebook: any) {
    if (isDocsLoading) return
    isDocsLoading = true
    selectedNotebookForDoc = notebook
    currentLevel = "docs"
    childDocsList = []
    docNavigationStack = []
    
    try {
      const result = await pluginInstance.kernelApi.getRootDocs(notebook.id)
      if (result.code !== 0) {
        pluginInstance.logger.error(`获取文档列表失败，错误码: ${result.code}, 错误信息: ${result.msg}`)
        rootDocsList = []
        return
      }
      const actualData = result.data || []
      rootDocsList = (actualData as any[]).map(doc => ({
        id: doc.id,
        title: doc.title || '(无标题)'
      }))
    } catch (error) {
      pluginInstance.logger.error("获取根文档列表失败", error)
      rootDocsList = []
    } finally {
      isDocsLoading = false
    }
  }

  const backToNotebookSelection = function () {
    currentLevel = "notebooks"
    selectedNotebookForDoc = null
    rootDocsList = []
    childDocsList = []
    docNavigationStack = []
  }

  const exploreDocument = async function (docId: string, docTitle: string) {
    if (isDocsLoading) return
    isDocsLoading = true
    
    docNavigationStack.push({
      level: currentLevel,
      data: currentLevel === "docs" ? [...rootDocsList] : [...childDocsList],
      parentInfo: { id: docId, title: docTitle }
    })
    
    currentLevel = "childDocs"
    
    try {
      const result = await pluginInstance.kernelApi.getChildDocs(docId, selectedNotebookForDoc.id)
      if (result.code !== 0) {
        pluginInstance.logger.error(`获取子文档列表失败，错误码: ${result.code}, 错误信息: ${result.msg}`)
        childDocsList = []
        return
      }
      const actualData = result.data || []
      childDocsList = (actualData as any[]).map(doc => ({
        id: doc.id,
        title: doc.title || '(无标题)'
      }))
    } catch (error) {
      pluginInstance.logger.error("获取子文档列表失败", error)
      childDocsList = []
    } finally {
      isDocsLoading = false
    }
  }

  const backToPreviousLevel = function () {
    if (docNavigationStack.length > 0) {
      const previousState = docNavigationStack.pop()
      currentLevel = previousState.level
      if (currentLevel === "docs") {
        rootDocsList = previousState.data
        childDocsList = []
      } else if (currentLevel === "childDocs") {
        childDocsList = previousState.data
      }
    } else {
      currentLevel = "docs"
      childDocsList = []
    }
  }

  const selectDocument = async function (docId: string, docTitle: string) {
    rootId = docId
    selectedDocTitle = docTitle
    showDocSelector = false
    
    storeConfig.rootId = rootId
    if (selectedDocTitle) {
      storeConfig.rootDocTitle = selectedDocTitle
    }
    await pluginInstance.saveData(storeName, storeConfig)
    
    if (storeConfig.reviewMode === "incremental") {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
    
    pluginInstance.logger.info(`已设置根文档为: ${docId} - ${docTitle}`)
  }

  // 切换到手动输入模式
  const switchToManualInput = function () {
    showManualInput = true
    showDocSelector = false
    manualInputId = rootId || ""
  }

  // 处理手动输入ID的确认
  const confirmManualInput = async function () {
    if (!manualInputId || manualInputId.trim() === "") {
      showMessage("请输入有效的文档ID", 3000, "error")
      return
    }
    
    const trimmedId = manualInputId.trim()
    
    try {
      const title = await pluginInstance.kernelApi.getDocTitle(trimmedId)
      if (title) {
        await selectDocument(trimmedId, title)
        showManualInput = false
        showMessage(`已设置根文档: ${title}`, 2000, "info")
      } else {
        const confirmed = confirm(`无法找到文档标题，文档ID可能无效。是否仍要使用 "${trimmedId}" 作为根文档？`)
        if (confirmed) {
          await selectDocument(trimmedId, "")
          showManualInput = false
          showMessage(`已设置根文档ID: ${trimmedId}`, 2000, "info")
        }
      }
    } catch (error) {
      pluginInstance.logger.error("验证文档ID失败:", error)
      const confirmed = confirm(`验证文档ID时出错。是否仍要使用 "${trimmedId}" 作为根文档？`)
      if (confirmed) {
        await selectDocument(trimmedId, "")
        showManualInput = false
        showMessage(`已设置根文档ID: ${trimmedId}`, 2000, "info")
      }
    }
  }

  // 取消手动输入
  const cancelManualInput = function () {
    showManualInput = false
    manualInputId = ""
  }

  // 已访问文档相关
  async function openVisitedDocs() {
    showVisitedDialog = true
    visitedLoading = true
    if (!pr) {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
    }
    const docs = await pr.getVisitedDocs(storeConfig)
    visitedDocs = await Promise.all(docs.map(async doc => {
      const lastTime = await pr.getRoamingLastTime(doc.id)
      return { ...doc, lastTime }
    }))
    visitedDocs.sort((a, b) => {
      if (!a.lastTime && !b.lastTime) return 0
      if (!a.lastTime) return 1
      if (!b.lastTime) return -1
      return b.lastTime.localeCompare(a.lastTime)
    })
    visitedLoading = false
  }

  function closeVisitedDialog() {
    showVisitedDialog = false
  }

  // 重置已访问并刷新列表
  async function resetVisitedAndRefresh() {
    await resetAllVisitCounts()
    // 刷新已访问文档列表
    if (showVisitedDialog) {
      await openVisitedDocs()
    }
  }

  function openDoc(docId: string) {
    openTab({
      app: pluginInstance.app,
      doc: { id: docId }
    })
  }

  function formatRoamingTime(isoTime?: string): string {
    if (!isoTime) return ''
    const date = new Date(isoTime)
    if (isNaN(date.getTime())) return ''
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}年${pad(date.getMonth()+1)}月${pad(date.getDate())}日${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  onMount(async () => {
    storeConfig = await pluginInstance.safeLoad(storeName)

    const res = await pluginInstance.kernelApi.lsNotebooks()
    notebooks = (res?.data as any)?.notebooks ?? []
    const hiddenNotebook: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"])
    notebooks = notebooks.filter((notebook) => !notebook.closed && !hiddenNotebook.has(notebook.name))
    
    if (storeConfig?.notebookId) {
      selectedNotebooks = storeConfig.notebookId.split(',').filter(id => id.trim() !== '')
    }
    if (selectedNotebooks.length === 0 && notebooks.length > 0) {
      selectedNotebooks = notebooks.map(notebook => notebook.id)
      storeConfig.notebookId = selectedNotebooks.join(',')
      await pluginInstance.saveData(storeName, storeConfig)
    }

    if (storeConfig?.tags) {
      if (Array.isArray(storeConfig.tags)) {
        selectedTags = [...storeConfig.tags]
      } else if (typeof storeConfig.tags === 'string') {
        selectedTags = (storeConfig.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        storeConfig.tags = selectedTags
        await pluginInstance.saveData(storeName, storeConfig)
      } else {
        selectedTags = []
      }
    } else {
      selectedTags = []
    }
    
    if (!storeConfig?.filterMode) {
      storeConfig.filterMode = FilterMode.Notebook
    }
    filterMode = storeConfig.filterMode
    rootId = storeConfig?.rootId ?? ""
    selectedDocTitle = storeConfig?.rootDocTitle ?? ""

    // 确保 reviewMode 有默认值
    if (!storeConfig.reviewMode) {
      storeConfig.reviewMode = ReviewMode.Incremental
    }

    if (storeConfig.reviewMode === "incremental") {
      pr = new IncrementalReviewer(storeConfig, pluginInstance)
      await pr.initIncrementalConfig()
      
      // 尝试恢复上次漫游的文档ID
      const savedDocId = (storeConfig as any).currentRndId
      pluginInstance.logger.info(`检查保存的文档ID: reviewMode=${storeConfig.reviewMode}, savedDocId=${savedDocId}, type=${typeof savedDocId}`)
      
      if (savedDocId && typeof savedDocId === 'string') {
        pluginInstance.logger.info(`开始验证保存的文档ID: ${savedDocId}`)
        // 验证文档是否仍然存在
        try {
          const blockResult = await pluginInstance.kernelApi.getBlockByID(savedDocId)
          if (blockResult) {
            // 文档存在，恢复文档ID并加载指标
            currentRndId = savedDocId
            pluginInstance.logger.info(`文档验证成功，开始加载指标: ${savedDocId}`)
            await refreshCurrentDocMetrics()
            pluginInstance.logger.info(`已恢复上次漫游的文档: ${savedDocId}`)
          } else {
            pluginInstance.logger.warn(`文档不存在，清除保存的ID: ${savedDocId}`)
            // 文档不存在，清除保存的ID
            (storeConfig as any).currentRndId = undefined
            await pluginInstance.saveData(storeName, storeConfig)
          }
        } catch (error) {
          pluginInstance.logger.error("验证保存的文档ID失败:", error)
          // 验证失败，清除保存的ID
          (storeConfig as any).currentRndId = undefined
          await pluginInstance.saveData(storeName, storeConfig)
        }
      } else {
        pluginInstance.logger.info(`没有保存的文档ID或格式不正确: savedDocId=${savedDocId}, type=${typeof savedDocId}`)
      }
    } else {
      pluginInstance.logger.info(`reviewMode不是incremental，跳过恢复文档ID: reviewMode=${storeConfig.reviewMode}`)
    }
  })
</script>

<div class="plugin-sidebar">
  <div class="sidebar-header">
    <h2>{pluginInstance.i18n.sidebarTitle || "漫游面板"}</h2>
  </div>

  <div class="sidebar-content">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <span class="filter-label">筛选:</span>
        <select
          bind:value={filterMode}
          class="filter-select"
          on:change={onFilterModeChange}
        >
          <option value={FilterMode.Notebook}>笔记本</option>
          <option value={FilterMode.Root}>根文档</option>
          <option value={FilterMode.Tag}>标签</option>
        </select>
      </div>

      {#if filterMode === FilterMode.Notebook}
        <div class="filter-row">
          <div class="notebook-selector-wrapper">
            <button
              class="filter-button"
              on:click={() => showNotebookSelector = !showNotebookSelector}
            >
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
                    <input
                      type="checkbox"
                      checked={selectedNotebooks.includes(notebook.id)}
                      on:change={() => toggleNotebook(notebook.id)}
                    />
                    {notebook.name}
                  </label>
                {/each}
                <div class="confirm-buttons">
                  <button
                    class="confirm-btn"
                    on:click={() => {
                      showNotebookSelector = false;
                      onNotebookChange();
                    }}
                  >
                    确定
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {:else if filterMode === FilterMode.Root}
        <div class="filter-row">
          <div class="doc-selector-wrapper">
            <button
              class="filter-button"
              on:click={startDocumentSelection}
            >
              {currentDocTitle}
            </button>
          </div>
        </div>
      {:else if filterMode === FilterMode.Tag}
        <div class="filter-row">
          <div class="tag-selector-wrapper">
            <button
              class="filter-button"
              on:click={loadAvailableTags}
              on:click={() => showTagDropdown = !showTagDropdown}
            >
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
                {#if availableTags.length > 0}
                  {#each availableTags as tag}
                    <label class="dropdown-item">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        on:change={() => toggleTag(tag)}
                      />
                      #{tag}
                    </label>
                  {/each}
                {:else}
                  <div class="empty-message">没有找到标签</div>
                {/if}
                <div class="confirm-buttons">
                  <button class="confirm-btn" on:click={clearAllTags}>
                    清空所有
                  </button>
                  <button class="confirm-btn" on:click={confirmTagSelection}>
                    确定
                  </button>
                </div>
              </div>
            {/if}
            {#if isTagsLoading}
              <div class="loading-message">加载中...</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- 文档指标区域 -->
    {#if currentRndId && pr && docMetrics.length > 0}
      <div class="metrics-section">
        <MetricsPanel
          pluginInstance={pluginInstance}
          docId={currentRndId}
          reviewer={pr}
          metrics={docMetrics}
          {docPriority}
          on:priorityChange={handleMetricsPanelPriorityChange}
        />
      </div>
    {:else if metricsLoading}
      <div class="metrics-loading">
        <div class="loading-message">正在加载文档指标...</div>
      </div>
    {:else if storeConfig?.reviewMode === "incremental"}
      <div class="metrics-empty">
        <div class="empty-message">当前没有正在漫游的文档</div>
        <div class="empty-hint">点击"继续漫游"按钮开始漫游后，这里将显示文档指标</div>
      </div>
    {/if}

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <button 
        class="primary-button" 
        on:click={doIncrementalRandomDoc}
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="loading-spinner"></span> 漫游中...
        {:else}
          继续漫游
        {/if}
      </button>
      
      <button 
        class="secondary-button" 
        on:click={openVisitedDocs}
        title="查看已漫游文档列表"
      >
        已漫游文档
      </button>
      
      <button
        class="secondary-button"
        on:click={() => showSettingMenu(pluginInstance)}
        title={pluginInstance.i18n.setting}
      >
        {@html icons.iconSetting}
      </button>
    </div>
  </div>

  <!-- 根文档选择器弹窗 -->
  {#if showDocSelector}
    <div class="tree-selector-overlay" role="button" tabindex="0" on:click={() => showDocSelector = false} on:keydown={(e) => e.key === 'Escape' && (showDocSelector = false)}>
      <div class="tree-selector-container" role="none" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="tree-selector-header">
          <h3>选择根文档</h3>
          <button class="tree-close-btn" on:click={() => showDocSelector = false}>×</button>
        </div>
        
        <div class="tree-selector-body">
          {#if currentLevel === "notebooks"}
            <div class="tree-header">
              <span class="tree-title">选择笔记本</span>
            </div>
            <div class="tree-content">
              {#each notebooks as notebook}
                <div class="tree-item notebook-item" role="button" tabindex="0" on:click={() => selectNotebookForDoc(notebook)} on:keydown={(e) => e.key === 'Enter' && selectNotebookForDoc(notebook)}>
                  <span class="tree-icon">📚</span>
                  <span class="tree-label">{notebook.name}</span>
                  <span class="tree-arrow">→</span>
                </div>
              {/each}
            </div>
          {:else if currentLevel === "docs"}
            <div class="tree-header">
              <button class="tree-back" on:click={backToNotebookSelection}>
                ← 返回
              </button>
              <span class="tree-title">{selectedNotebookForDoc?.name}</span>
              <button class="tree-manual-btn" on:click={switchToManualInput}>
                输入ID
              </button>
            </div>
            <div class="tree-content">
              {#if isDocsLoading}
                <div class="tree-loading">加载中...</div>
              {:else if rootDocsList.length > 0}
                {#each rootDocsList as doc}
                  <div class="tree-item doc-item">
                    <span class="tree-icon">📄</span>
                    <span class="tree-label">{doc.title}</span>
                    <div class="tree-actions">
                      <button 
                        class="tree-action-btn explore-btn" 
                        on:click={() => exploreDocument(doc.id, doc.title)}
                        title="查看子文档"
                      >
                        🔍
                      </button>
                      <button 
                        class="tree-action-btn select-btn" 
                        on:click={() => selectDocument(doc.id, doc.title)}
                        title="选择此文档"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="tree-empty">该笔记本下没有根文档</div>
              {/if}
            </div>
          {:else if currentLevel === "childDocs"}
            <div class="tree-header">
              <button class="tree-back" on:click={backToPreviousLevel}>
                ← 返回
              </button>
              <span class="tree-title">子文档</span>
              <button class="tree-manual-btn" on:click={switchToManualInput}>
                输入ID
              </button>
            </div>
            <div class="tree-content">
              {#if isDocsLoading}
                <div class="tree-loading">加载中...</div>
              {:else if childDocsList.length > 0}
                {#each childDocsList as doc}
                  <div class="tree-item doc-item">
                    <span class="tree-icon">📄</span>
                    <span class="tree-label">{doc.title}</span>
                    <div class="tree-actions">
                      <button 
                        class="tree-action-btn explore-btn" 
                        on:click={() => exploreDocument(doc.id, doc.title)}
                        title="查看子文档"
                      >
                        🔍
                      </button>
                      <button 
                        class="tree-action-btn select-btn" 
                        on:click={() => selectDocument(doc.id, doc.title)}
                        title="选择此文档"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="tree-empty">该文档下没有子文档</div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- 手动输入ID弹窗 -->
  {#if showManualInput}
    <div class="tree-selector-overlay" role="button" tabindex="0" on:click={cancelManualInput} on:keydown={(e) => e.key === 'Escape' && cancelManualInput()}>
      <div class="manual-input-container" role="none" on:click|stopPropagation on:keydown|stopPropagation>
        <div class="manual-input-header">
          <h3>手动输入文档ID</h3>
          <button class="tree-close-btn" on:click={cancelManualInput}>×</button>
        </div>
        
        <div class="manual-input-body">
          <div class="manual-input-group">
            <label for="manual-id-input">文档ID：</label>
            <input 
              id="manual-id-input"
              type="text" 
              class="b3-text-field"
              bind:value={manualInputId}
              placeholder="请输入文档ID"
              on:keydown={(e) => e.key === 'Enter' && confirmManualInput()}
            />
          </div>
          
          <div class="manual-input-actions">
            <button class="b3-button b3-button--outline" on:click={cancelManualInput}>
              取消
            </button>
            <button class="b3-button" on:click={confirmManualInput}>
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- 已访问文档弹窗 -->
  {#if showVisitedDialog}
    <div class="dialog-mask" role="button" tabindex="0" on:click={closeVisitedDialog} on:keydown={(e) => e.key === 'Escape' && closeVisitedDialog()}></div>
    <div class="dialog">
      <div class="dialog-header">
        <span>已漫游文档列表</span>
        <button class="close-btn" on:click={closeVisitedDialog}>×</button>
      </div>
      <!-- 重置按钮 -->
      <button 
        class="reset-visited-btn" 
        on:click={resetVisitedAndRefresh} 
        title="清空已漫游的文档记录"
      >
        重置已漫游
      </button>
      <div class="dialog-content">
        {#if visitedLoading}
          <div class="loading-message">加载中...</div>
        {:else if visitedDocs.length === 0}
          <div class="empty-message">暂无已漫游文档</div>
        {:else}
          <ul class="visited-list">
            {#each visitedDocs as doc}
              <li>
                <span class="visited-title" role="button" tabindex="0" on:click={() => openDoc(doc.id)} on:keydown={(e) => e.key === 'Enter' && openDoc(doc.id)}>{doc.content || '(无标题)'}</span>
                <small>{formatRoamingTime(doc.lastTime)}</small>
              </li>
            {/each}
          </ul>
        {/if}
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
    padding: 12px 16px;
    border-bottom: 1px solid var(--b3-theme-border);
    flex-shrink: 0;
  }

  .sidebar-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--b3-theme-on-background);
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
  }

  .filter-section {
    margin-bottom: 16px;
  }

  .filter-row {
    margin-bottom: 8px;
    position: relative;
  }

  .filter-label {
    font-size: 13px;
    margin-right: 8px;
    color: var(--b3-theme-on-surface);
  }

  .filter-select {
    flex: 1;
    padding: 6px 8px;
    font-size: 13px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    cursor: pointer;
  }

  .notebook-selector-wrapper,
  .doc-selector-wrapper,
  .tag-selector-wrapper {
    position: relative;
  }

  .filter-button {
    width: 100%;
    padding: 6px 8px;
    font-size: 13px;
    text-align: left;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    cursor: pointer;
  }

  .filter-button:hover {
    background: var(--b3-theme-hover);
  }

  .dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
    background: var(--b3-theme-surface);
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
  }

  .dropdown-item:hover {
    background: var(--b3-theme-hover);
  }

  .dropdown-item input {
    margin-right: 8px;
  }

  .confirm-buttons {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-top: 1px solid var(--b3-theme-border);
  }

  .confirm-btn {
    flex: 1;
    padding: 6px 12px;
    font-size: 12px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    cursor: pointer;
  }

  .confirm-btn:hover {
    background: var(--b3-theme-hover);
  }

  .loading-message,
  .empty-message {
    padding: 12px;
    text-align: center;
    font-size: 13px;
    color: var(--b3-theme-on-surface);
    opacity: 0.7;
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    padding: 10px 16px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .primary-button {
    background: var(--b3-theme-primary);
    color: var(--b3-theme-on-primary);
  }

  .primary-button:hover:not(:disabled) {
    opacity: 0.9;
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .secondary-button {
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    border: 1px solid var(--b3-theme-border);
  }

  .secondary-button:hover {
    background: var(--b3-theme-hover);
  }

  .loading-spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }

  .dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    background: var(--b3-theme-surface);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    display: flex;
    flex-direction: column;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--b3-theme-border);
  }

  .dialog-header span {
    font-size: 16px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--b3-theme-on-surface);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    opacity: 0.7;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .reset-visited-btn {
    margin: 12px 16px;
    padding: 8px 16px;
    font-size: 13px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background: var(--b3-theme-surface);
    color: var(--b3-theme-on-surface);
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-visited-btn:hover {
    background: var(--b3-theme-hover);
  }

  /* 根文档选择器样式 */
  .tree-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .tree-selector-container,
  .manual-input-container {
    background: var(--b3-theme-background);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    width: 500px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .tree-selector-header,
  .manual-input-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--b3-theme-surface);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tree-selector-header h3,
  .manual-input-header h3 {
    margin: 0;
    font-size: 16px;
    color: var(--b3-theme-on-surface);
  }

  .tree-close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--b3-theme-on-surface-light);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tree-close-btn:hover {
    color: var(--b3-theme-on-surface);
  }

  .tree-selector-body {
    padding: 0;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .tree-header {
    padding: 12px 20px;
    border-bottom: 1px solid var(--b3-theme-surface);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--b3-theme-surface-light);
  }

  .tree-title {
    font-weight: 500;
    color: var(--b3-theme-on-surface);
  }

  .tree-back,
  .tree-manual-btn {
    background: none;
    border: none;
    color: var(--b3-theme-primary);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .tree-back:hover,
  .tree-manual-btn:hover {
    background: var(--b3-theme-primary-light);
  }

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  .tree-item {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid var(--b3-theme-surface);
    transition: background-color 0.2s;
  }

  .tree-item:hover {
    background: var(--b3-theme-surface-light);
  }

  .tree-item:last-child {
    border-bottom: none;
  }

  .tree-icon {
    margin-right: 8px;
    font-size: 14px;
  }

  .tree-label {
    flex: 1;
    color: var(--b3-theme-on-surface);
    font-size: 14px;
  }

  .tree-arrow {
    color: var(--b3-theme-on-surface-light);
    font-size: 12px;
  }

  .tree-actions {
    display: flex;
    gap: 4px;
  }

  .tree-action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 3px;
    font-size: 12px;
    transition: background-color 0.2s;
  }

  .tree-action-btn:hover {
    background: var(--b3-theme-surface);
  }

  .explore-btn {
    color: var(--b3-theme-primary);
  }

  .select-btn {
    color: var(--b3-theme-success);
  }

  .tree-loading,
  .tree-empty {
    padding: 20px;
    text-align: center;
    color: var(--b3-theme-on-surface-light);
    font-size: 14px;
  }

  /* 手动输入弹窗样式 */
  .manual-input-body {
    padding: 20px;
  }

  .manual-input-group {
    margin-bottom: 16px;
  }

  .manual-input-group label {
    display: block;
    margin-bottom: 8px;
    color: var(--b3-theme-on-surface);
    font-size: 14px;
  }

  .manual-input-group input {
    width: 100%;
  }

  .manual-input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .visited-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .visited-list li {
    padding: 10px 0;
    border-bottom: 1px solid var(--b3-theme-border);
  }

  .visited-list li:last-child {
    border-bottom: none;
  }

  .visited-title {
    cursor: pointer;
    color: var(--b3-theme-primary);
    display: block;
    margin-bottom: 4px;
  }

  .visited-title:hover {
    text-decoration: underline;
  }

  .visited-list small {
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    opacity: 0.6;
  }

  /* 文档指标区域样式 - 与侧边栏其他控件统一 */
  .metrics-section {
    margin-top: 12px;
  }

  /* 覆盖 MetricsPanel 的样式，使其与侧边栏其他控件一致 */
  .metrics-section :global(.metrics-panel) {
    margin-top: 0;
    padding: 8px 12px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background-color: var(--b3-theme-surface);
    box-shadow: none;
    font-size: 13px;
  }

  .metrics-section :global(.metrics-title) {
    border-bottom-color: var(--b3-theme-border);
    padding-bottom: 6px;
    margin-bottom: 8px;
  }

  .metrics-section :global(.metrics-title h3) {
    font-size: 13px;
    font-weight: 500;
  }

  /* 隐藏优先级标签，并调整布局使其与指标对齐 */
  .metrics-section :global(.priority-label) {
    display: none;
  }

  /* 调整优先级编辑行，使其与指标项对齐 */
  .metrics-section :global(.priority-edit-row) {
    justify-content: flex-end;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }

  .metrics-section :global(.priority-edit-group) {
    margin-left: auto;
    /* 确保与指标控制按钮对齐 */
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metrics-section :global(.metric-item) {
    padding: 4px 0;
    margin-bottom: 6px;
  }

  .metrics-section :global(.metric-controls button) {
    border-color: var(--b3-theme-border);
    background-color: var(--b3-theme-surface);
  }

  .metrics-section :global(.metric-controls button:hover) {
    background-color: var(--b3-theme-hover);
  }

  .metrics-section :global(.metric-value) {
    border-color: var(--b3-theme-border);
    background-color: var(--b3-theme-background);
    width: 45px;
  }

  .metrics-section :global(.roaming-count-section) {
    margin-top: 8px;
    padding-top: 8px;
    border-top-color: var(--b3-theme-border);
  }

  .metrics-section :global(.priority-btn) {
    border-color: var(--b3-theme-border);
    background-color: var(--b3-theme-surface);
  }

  .metrics-section :global(.priority-btn:hover) {
    background-color: var(--b3-theme-hover);
  }

  .metrics-section :global(.priority-input) {
    border-color: var(--b3-theme-border);
    background-color: var(--b3-theme-background);
    width: 45px;
  }

  .metrics-section :global(.no-metrics-message),
  .metrics-section :global(.loading-message),
  .metrics-section :global(.error-message) {
    border-color: var(--b3-theme-border);
    background-color: var(--b3-theme-surface);
  }

  .metrics-loading,
  .metrics-empty {
    margin-top: 12px;
    padding: 8px 12px;
    border: 1px solid var(--b3-theme-border);
    border-radius: 4px;
    background-color: var(--b3-theme-surface);
  }

  .metrics-loading .loading-message,
  .metrics-empty .empty-message {
    padding: 0;
    text-align: center;
    font-size: 13px;
    color: var(--b3-theme-on-surface);
    opacity: 0.7;
  }

  .metrics-empty .empty-hint {
    padding: 4px 0 0 0;
    text-align: center;
    font-size: 12px;
    color: var(--b3-theme-on-surface);
    opacity: 0.5;
  }
</style>
