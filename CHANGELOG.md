# Changelog

## [2.1.1] (2025-07-17)

### Bug Fixes
* 修复点图中拖动点时不跟手、瞬移的问题

### Features
* 增强点图功能，鼠标悬停可查看文档标题，拖动可改变优先级（所有点均可拖动）
* 点图中，右击某点可新标签页打开该文档

## [2.1.0] (2025-07-16)

### Bug Fixes
* 修复点图中文档点与标度不符合的问题
* 修复优先级列表中调整优先级后出现的显示错误问题

### Features
* 修改优先级显示精度为小数点后两位，微调精度由0.1改为0.01，长按可快速调整
* 增加批量随机重置文档优先级功能，将指定优先级范围的文档重置为随机的新优先级值

## [2.0.1] (2025-07-15)

### Bug Fixes
* 修复点图中红点拖动调整不跟手的问题
* 修复面板优先级调整后，点图红点不能及时更新的问题
* 删除继续漫游后的大加载图标及颜色变化，移动到了"继续漫游"按钮上

### Features
* 增加快捷键，可方便快速开始漫游、继续漫游、重置已访问

## [2.0.0] (2025-07-12)

### Features
* 删除一遍过模式，只保留渐进阅读模式
* 增加条带状点图，更清晰看到文档的优先级情况，可随时拖动调整优先级
* 可直接调整优先级，相关联的文档指标会随之等比例变化
* 增加已漫游文档列表+热力图，可批量调节优先级情况，可拖动排序，优先级自动变为前后两个文档优先级平均数
* 调整优化漫游面板UI，增加了漫游次数和上次访问时间
* 增加绝对优先级顺序漫游的功能，设置为1则绝对按照优先级顺序先后漫游文档，设置为0则完全按照优先级为权重概率的轮盘赌方式漫游，设置为小数则有概率按优先级绝对顺序漫游，否则轮盘赌

## [1.2.1] (2025-07-07)

### Features
* 增加设置项：每次开启思源时自动重置已访问文档记录

## [1.2.0] (2025-07-06)

### Features
* 针对特定文档，可以将其在渐进阅读页面打开，使用方法：先浏览该文档，再点击顶栏插件按钮即可跳转
* 渐进阅读页面取消了只读，可简单编辑的功能
* 将指标参数加减按钮跨度由0.1改为了1
* 笔记本选择可多选，可自由组合

## [1.1.1] (2025-05-12)

### Bug Fixes
* 修复了一遍过模式下显示剩余文档数量不正确的问题
* 优化了自定义SQL模式下的剩余文档数量计算方式

## [1.1.0] (2025-05-08)

### Enhancement
* 提高了机遇优先级的轮盘赌推荐算法稳定性
* 增加了计算概率时的提示信息
* 更改了设置页面，右键顶栏插件图标即可进入设置页面
* 设定了所有文档指标默认值为5
* 修改指标信息时增加了为所有文档更新的动作，确保指标值不为0
* 查看文档指标信息时，出现为0或者空值的指标，自动修正为默认值5
* 增加了漫游历史查看功能

## [1.0.1] (2025-05-07)

### Enhancement
* 美化提示信息，增加诗意表达
* 改进帮助文档链接，指向GitHub仓库中文文档

## [1.0.0] (2025-05-06)

### Features
* First available version of Incremental Reading
* Added user-defined article parameters and weights
* Added priority calculation based on parameters
* Implemented roulette wheel algorithm for document recommendation
* Added support for notebook and root document filtering
* Added support for completely random "one-pass" mode