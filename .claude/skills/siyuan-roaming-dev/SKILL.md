---
name: siyuan-roaming-dev
description: 为漫游式渐进阅读 SiYuan 插件的后续修改、优化、调试和开发提供项目背景、代码结构、关键入口与注意事项。
---

# 漫游式渐进阅读插件开发背景

当用户要修改、优化、调试、扩展本仓库时，先使用本 skill 建立上下文。本项目是 SiYuan 笔记插件 `roaming-mode-incremental-reading`，中文名“漫游式渐进阅读”。核心目标不是闪卡复习或对抗遗忘，而是解决渐进阅读第一步：在大量已有文档中按优先级、筛选范围和推荐算法选择下一篇“稍后阅读”的文档。

## 项目定位

- 插件元数据在 `plugin.json`，当前插件支持 desktop、browser-desktop、mobile、browser-mobile，以及 windows/linux/darwin/docker/ios/harmony/android 后端。
- README 在 `README.md` 和 `README_zh_CN.md`，中文 README 更适合理解产品语义。
- 核心理念：渐进阅读的核心是“稍后阅读”，不是用 FSRS/遗忘曲线推荐长文复习。
- 主要能力：文档筛选、指标权重、优先级维护、轮盘赌漫游、绝对优先级漫游、已访问排除、漫游次数记录、最近漫游时间记录、多锚点 TF-IDF 智能推荐、推荐优先级对齐、桌面侧栏、顶栏入口和移动端浮动入口。

## 技术栈与命令

- TypeScript + Svelte 4 + Vite + SiYuan Plugin API。
- 包管理器：`pnpm@9.13.2`。
- 常用命令：
  - `pnpm dev`：`vite build --watch`。
  - `pnpm dev:siyuan`：读取 `.env` 中的 `SIYUAN_PLUGIN_DIR`，watch 构建到 SiYuan 插件目录。
  - `pnpm build`：普通构建。
  - `pnpm build:release`：生产构建。
  - `pnpm test`：Vitest watch。
  - `pnpm package`：运行 `scripts/package.py` 打包。
- 构建配置在 `vite.config.ts`：入口 `src/index.ts`，输出 CommonJS，外部化 `siyuan`，静态复制 README、LICENSE、icon、preview、plugin.json、`src/i18n/**`。watch/dev 模式下如果有 `SIYUAN_PLUGIN_DIR` 会输出到 `${SIYUAN_PLUGIN_DIR}/roaming-mode-incremental-reading`。

## 代码结构速览

- `src/index.ts`：插件主入口，导出 `RandomDocPlugin extends Plugin`；负责加载配置、初始化顶栏、命令、移动端浮动按钮、右侧 dock 侧栏、日志开关、配置归一化和卸载清理。
- `src/topbar.ts`：顶栏按钮、右键设置弹窗、快捷命令。左键通常调用侧栏实例 `triggerRoam()`；右键打开 `RandomDocSetting.svelte`。
- `src/floatingButton.ts`：移动端浮动按钮，保存位置到 localStorage，点击优先调用侧栏 `triggerRoam()`，侧栏未就绪时有移动端直接漫游兜底。
- `src/api/base-api.ts`：基础 SiYuan API POST/SQL 请求封装。
- `src/api/kernel-api.ts`：SiYuan kernel API 封装，如 SQL、块属性、文档 Markdown、笔记本、根文档、最近文档等。
- `src/service/IncrementalReviewer.ts`：最核心业务服务，负责筛选、随机漫游、优先级、指标、访问记录、漫游次数、最近漫游时间、修复指标、清空插件数据等。
- `src/service/RecommendationService.ts`：智能推荐服务，负责多锚点 TF-IDF 推荐。
- `src/models/RandomDocConfig.ts`：主配置模型和筛选模式。
- `src/models/IncrementalConfig.ts`：指标、文档优先级数据、优先级计算模型。
- `src/models/RecommendationConfig.ts`：推荐配置类型和默认值。
- `src/libs/PluginSidebar.svelte`：当前最重要的桌面侧栏 UI，包含筛选、指标、漫游、点状图、优先级列表、已漫游列表、漫游次数列表、推荐列表和优先级对齐。
- `src/libs/RandomDocSetting.svelte`：设置弹窗，包含基本配置、文档指标配置、批量优先级重置、智能推荐设置和清空数据等功能。
- `src/libs/MetricsPanel.svelte`：当前文档指标和总优先级编辑面板。
- `src/libs/PriorityBarChart.svelte`：优先级 SVG 点状图，支持拖动调整和右键打开文档。
- `src/libs/MobileSidebarDialog.svelte`：移动端侧栏浮窗，复用 `PluginSidebar.svelte`。
- `src/libs/MobileFloatingActions.svelte`：移动端浮动操作按钮组。
- `src/utils/textUtil.ts`：推荐算法用 Markdown 采样、清理和分词。
- `src/utils/pageUtil.ts`：当前文档 ID 获取，部分逻辑依赖 SiYuan DOM。
- `src/utils/svg.ts`：图标 SVG。
- `src/stores/lockStore.ts`：锁定编辑状态。

## 关键数据模型

### 主配置 `RandomDocConfig`

文件：`src/models/RandomDocConfig.ts`。

重要字段：

- `filterMode`：`notebook`、`root`、`tag`、`sql`。
- `notebookId`、`rootId`、`rootDocTitle`、`tags`、`sqlQuery`：筛选范围。
- `incrementalConfigId`：渐进指标配置存储 ID，默认 `incremental_config`。
- `excludeVisited`：是否排除已访问文档，默认 true。
- `recentAnchorCount`：最近漫游锚点数，默认 3。
- `topAnchorCount`：漫游次数最多锚点数，默认 2。
- `recommendTopK`：推荐输出数量，默认 8。
- `recommendMaxCandidates`：推荐候选上限，默认 120。
- `recommendMaxParagraphs`：采样段落上限，默认 8。
- `autoAlignRecommendationPriority`：是否自动对齐推荐文档优先级。
- `autoResetOnStartup`、`autoReloadWhenEmpty`、`enableDebugLog`。
- `absolutePriorityProb`：直接选择最高优先级文档的概率，0 到 1。

`src/index.ts` 会用 `normalizeMainConfig()` 对历史配置和非法值做归一化。新增配置字段时通常要同时改 `RandomDocConfig.ts`、`RandomDocSetting.svelte` 和 `index.ts` 的归一化逻辑。

### 指标配置 `IncrementalConfig`

文件：`src/models/IncrementalConfig.ts`。

- `Metric`：`id`、`name`、`value`、`weight`、`description`。
- 默认指标：重要性 `importance` 权重 40，紧急度 `urgency` 权重 30，难度 `difficulty` 权重 30，默认值均为 5。
- 总优先级计算：`sum(metricValue * metric.weight) / sum(metric.weight)`。

## SiYuan 自定义属性

插件把文档级数据写入块属性：

- `custom-metric-${metric.id}`：某文档某指标值。
- `custom-priority`：文档总优先级。
- `custom-visit-count`：访问记录，用于 `excludeVisited`。
- `custom-roaming-count`：漫游次数。
- `custom-roaming-last`：最近漫游时间，ISO 字符串。

修改指标、总优先级、批量重置或推荐对齐时，必须保持 `custom-metric-*` 与 `custom-priority` 一致。

## 随机漫游流程

核心在 `src/service/IncrementalReviewer.ts` 的 `getRandomDoc(config?)`，UI 入口主要在 `src/libs/PluginSidebar.svelte` 的 `doIncrementalRandomDoc()`。

流程：

1. `buildFilterCondition(config?)` 根据筛选模式构造 SQL 条件。
2. 如果 `excludeVisited` 开启，排除已有 `custom-visit-count` 的文档。
3. 查询候选文档总数。
4. 如果无候选且 `autoReloadWhenEmpty` 开启，调用 `resetVisited()` 后重试。
5. 分页读取候选文档 ID。
6. 批量读取 `custom-priority`，缺失或异常时用默认/修复逻辑。
7. 按 `absolutePriorityProb` 决定是否直接取最高优先级文档；否则按优先级权重轮盘赌选择。
8. 记录本次选择概率。
9. 更新访问记录并返回 `{ docId, isAbsolutePriority }`。
10. UI 侧再刷新指标、计数、点图、列表、推荐，并打开文档。

## 筛选模式

核心方法：`IncrementalReviewer.buildFilterCondition(config?)`。

- 笔记本模式：生成 `box IN (...)`。
- 根文档模式：通常用 `path LIKE '%rootId%'` 限制文档树。
- 标签模式：从 `blocks` 表按 tag 查 `root_id`。
- SQL 模式：执行用户 SQL，取每行第一个字段作为文档 ID，再构造 `id IN (...)`。

这里 SQL 字符串拼接很多。涉及用户输入、标签、rootId、notebookId、id 列表时要特别注意转义、空列表、单引号和 LIKE 语义。

## 智能推荐流程

核心在 `src/service/RecommendationService.ts`，文本工具在 `src/utils/textUtil.ts`。

推荐算法：

1. 复用当前漫游筛选条件。
2. 用最近漫游 N 篇（`custom-roaming-last`）和漫游次数最多 M 篇（`custom-roaming-count`）作为 anchors，合并去重。
3. 在当前筛选范围内排除 anchors，按 `updated DESC` 取最多 `maxCandidates` 个 candidates。
4. 对 anchors 和 candidates 调 `kernelApi.getDocMarkdown()` 获取 Markdown。
5. `sampleMarkdown()` 使用标题 + 头/中/尾段落采样。
6. `tokenize()` 英文按词、中文按字，并过滤停用词。
7. 构建 TF-IDF 稀疏向量。
8. 候选与每个 anchor 计算余弦相似度，过滤非正分数后取平均。
9. 按 score 降序取 Top K。
10. 侧栏展示推荐；打开推荐文档时调用 `recordVisitAndRoam(docId)` 更新访问和漫游记录。

推荐刷新可能较重，默认候选 120 篇，长文和移动端可能有性能压力。优化推荐时优先考虑缓存、降低刷新频率、改进采样/分词、BM25 或多样性重排。

## 推荐优先级对齐

主要实现位于 `src/libs/PluginSidebar.svelte`。

逻辑大意：读取推荐文档当前优先级，计算优先级 min/max；把推荐 score 归一化后映射回优先级区间；按新旧优先级比例调整所有指标值，并更新 `custom-metric-*` 和 `custom-priority`。配置开关是 `autoAlignRecommendationPriority`。

修改这块时重点确认：极值保护、优先级范围过窄时的扩展、指标值边界、批量更新失败时的一致性。

## UI 修改入口

- 修改桌面侧栏主交互：`src/libs/PluginSidebar.svelte`。
- 修改设置弹窗：`src/libs/RandomDocSetting.svelte`。
- 修改当前文档指标编辑：`src/libs/MetricsPanel.svelte`。
- 修改优先级点图：`src/libs/PriorityBarChart.svelte`。
- 修改顶栏行为或快捷键：`src/topbar.ts`。
- 修改移动端浮动按钮：`src/floatingButton.ts`。
- 修改移动端浮窗：`src/libs/MobileSidebarDialog.svelte`。
- 修改移动端浮动操作组：`src/libs/MobileFloatingActions.svelte`。

`src/libs/RandomDocContent.svelte` 可能是旧版或历史 UI，改 UI 前先 grep 引用，不要直接删除。

## 常见开发任务定位

- 新增配置项：`RandomDocConfig.ts`、`index.ts normalizeMainConfig()`、`RandomDocSetting.svelte`，必要时同步 `PluginSidebar.svelte`。
- 新增筛选模式：`RandomDocConfig.ts` 的 `FilterMode`、`IncrementalReviewer.buildFilterCondition()`、`PluginSidebar.svelte` 筛选 UI 和历史记录逻辑。
- 修改随机算法：`IncrementalReviewer.getRandomDoc()`、轮盘赌选择和 `calculateSelectionProbability()`。
- 修改指标计算：`IncrementalConfig.ts`、`IncrementalReviewer` 指标更新/修复、`MetricsPanel.svelte` 总优先级编辑。
- 修改推荐算法：`RecommendationService.ts`、`textUtil.ts`、`RecommendationConfig.ts`、`PluginSidebar.svelte` 推荐刷新/展示。
- 修改批量修复或清空数据：`IncrementalReviewer.repairAllDocumentMetrics()`、`clearAllDocumentData()`、`RandomDocSetting.svelte`。
- 修改当前文档获取或打开逻辑：`pageUtil.ts`、`PluginSidebar.svelte`、`floatingButton.ts`。
- 修改构建/打包：`vite.config.ts`、`scripts/*.py`、`package.json`。

## 风险与注意事项

1. SQL 拼接风险：`IncrementalReviewer.ts`、`RecommendationService.ts`、`kernel-api.ts` 中有大量拼接；不要把未经处理的用户输入直接拼入 SQL。
2. 属性一致性风险：指标值和总优先级分开存储，任何修改指标或优先级的路径都要同步另一边。
3. 历史配置兼容：`index.ts` 的 normalize 方法是为了兼容旧配置，新增字段时要设置合理默认值并处理旧数据。
4. 推荐性能：推荐算法会读取多篇 Markdown 并分词，避免在高频 UI 事件中反复触发。
5. `textUtil.ts` 的 Markdown 清理正则建议用测试覆盖，尤其是代码块、链接、图片、标题、引用和横线。
6. `pageUtil.ts` 的当前页面获取依赖 SiYuan DOM，SiYuan 前端结构变化可能导致失效。
7. `IncrementalReadingConfig.ts`、`IncrementalConfigPanel.svelte` 可能是旧实现或备用实现；清理前必须查引用。
8. `MobileFloatingActions.svelte` 中部分拖动逻辑不完整，移动端优化前先确认实际调用链。
9. `clearAllDocumentData()` 会清空所有插件写入的文档属性，是不可逆危险操作；改相关 UI 时保留明确确认。
10. `vite.config.ts` 中 `emptyOutDir: false` 可避免误删插件目录，但发布前要注意旧产物残留。

## 开发建议

- 修改前先从目标功能定位到对应入口文件，不要全局重构。
- 对 UI/frontend 改动，按项目要求应尽量启动插件环境或至少构建验证；如果无法真实在 SiYuan 中验证，要明确说明未完成手动 UI 验证。
- 优先保持现有 Svelte 组件和 SiYuan API 封装风格。
- 新增或修改危险操作、批量属性写入、SQL 模式时要更谨慎，必要时先做小范围验证。
- 如果用户只要求局部 bug 修复，不要顺手清理旧组件或重构推荐算法。
