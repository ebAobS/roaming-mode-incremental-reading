# 移动端浮窗操作按钮组件

## 功能说明

这个组件为移动端用户提供了便捷的浮窗操作按钮，主要包含：

### 🔴 关闭按钮 (位置：右下角)
- **图标**: ✕ 
- **颜色**: 红色
- **功能**: 关闭渐进阅读界面

### 📖 跳转按钮 (位置：右下角中间)
- **图标**: 📖 
- **颜色**: 绿色
- **功能**: 关闭渐进阅读并跳转到当前正在阅读的文档
- **显示条件**: 仅当有当前文档时显示

### 🎲 漫游按钮 (位置：右下角上方)
- **图标**: 🎲 (加载时显示 ⏳)
- **颜色**: 蓝色
- **功能**: 执行随机文档漫游

## 使用方法

```svelte
<MobileFloatingActions 
  {pluginInstance}
  {currentRndId}
  {isLoading}
  onCloseAction={handleClose}
  onRoamAction={handleRoam}
/>
```

## Props

- `pluginInstance`: 插件实例
- `currentRndId`: 当前文档ID（用于跳转功能）
- `isLoading`: 是否正在加载中
- `onCloseAction`: 关闭操作回调函数
- `onRoamAction`: 漫游操作回调函数

## 特性

- ✅ 只在移动端显示
- ✅ 支持拖拽移动（待实现）
- ✅ 智能消息提示
- ✅ 使用正确的移动端跳转API
- ✅ 错误处理和用户反馈
- ✅ 美观的动画效果

## 跳转逻辑

1. 关闭当前渐进阅读界面
2. 延迟300ms确保关闭完成
3. 使用 `openMobileFileById(app, docId)` API 打开目标文档
4. 失败时提供文档标题作为备用信息
