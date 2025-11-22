<div class="sy__outline" style="max-width: 800px; margin: 0 auto;">
    <style>
        .sy__outline {
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            color: #0f172a;
            line-height: 1.65;
        }
        .sy__outline h1,
        .sy__outline h2,
        .sy__outline h3,
        .sy__outline h4 {
            color: #0f172a;
            font-weight: 600;
        }
        .sy__outline p,
        .sy__outline li,
        .sy__outline summary {
            color: #0f172a;
        }
        .sy__outline code {
            background: #eef2ff;
            color: #312e81;
            padding: 0.1em 0.4em;
            border-radius: 6px;
            font-weight: 500;
        }
        .sy__outline details {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.9em 1em;
            box-shadow: 0 6px 20px rgba(15,23,42,0.06);
        }
        .sy__outline details summary {
            list-style: none;
            font-weight: 600;
        }
        .sy__outline details summary::marker {
            display: none;
        }
        .sy__outline details + details {
            margin-top: 1em;
        }
    </style>
    <div style="text-align: center; padding: 2em; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px;">
        <h1 style="color: white; margin: 0; font-size: 2.2em;">📚 漫游式渐进阅读</h1>
        <div style="color: rgba(255,255,255,0.9); margin-top: 0.5em; font-size: 1.1em;">智能推荐算法驱动的渐进阅读插件，实现无压力的"稍后阅读"学习体验</div>
        <div style="margin-top: 1.5em; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/blob/main/CHANGELOG.md"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">🗓 更新日志</a>
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/issues"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">💬 问题反馈</a>
            <a href="https://ld246.com/article/1746802777105"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">📖 讨论帖</a>
        </div>
    </div>
    <!-- 项目信息 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fbbf24; border-radius: 8px; box-shadow: 0 4px 12px rgba(245,158,11,0.15);">
        <h2 style="color: #d97706; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🤝 项目信息</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>项目地址</strong>：<a href="https://github.com/ebAobS/roaming-mode-incremental-reading" style="color: #d97706;">GitHub Repository</a>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>讨论帖</strong>：<a href="https://ld246.com/article/1746802777105" style="color: #d97706;">漫游式渐进阅读 | 唯一能用的渐进阅读推荐解决方案</a>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>联系方式</strong>：微信 ebAobS，欢迎加入交流群
            </li>
        </ul>
    </div>
    <!-- 核心理念 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fef7ff, #fdf2f8); border: 1px solid #f9a8d4; border-radius: 8px; box-shadow: 0 4px 12px rgba(236,72,153,0.15);">
        <h2 style="color: #be185d; margin: 0 0 1em; text-align: center; font-size: 1.3em;">💡 核心理念</h2>
        <div style="background: white; padding: 1.5em; border-radius: 8px; border-left: 4px solid #ec4899;">
            <p style="margin: 0.5em 0; line-height: 1.6;"><strong>渐进阅读应该与闪卡区分开来：</strong></p>
            <ul style="margin: 0.5em 0; padding-left: 1.2em;">
                <li style="margin: 0.3em 0;"><strong>闪卡</strong>复习算法原理是<strong>遗忘曲线</strong>，这方面思源闪卡系统+FSRS算法已经足够完善。多年使用Anki、SuperMemo的经验告诉我们，卡片的“最小信息原则”极其重要。</li>
                <li style="margin: 0.3em 0;"><strong>渐进阅读</strong>面对的是大段文本，先天不符合“最小信息原则”。目前大多数渐进阅读解决方案惯性地使用遗忘曲线为原理的复习算法（如FSRS）来推荐复习文章，这并不合理。</li>
            </ul>
            <p style="margin: 0.5em 0; line-height: 1.6;">对于一篇洋洋洒洒的文章，很难<strong>单纯的使用记忆程度</strong>作为下次是否<strong>被推荐复习的标准</strong>。真正的<strong>标准应该是多元</strong>的，比如难度、学习进度、学习内容的重要程度、紧急程度、感兴趣程度等。</p>
            <p style="margin: 0.5em 0; line-height: 1.6;"><strong>总之，渐进阅读的核心目的并不是“对抗遗忘”，而是实现无压力的“稍后阅读”，最终高效地同时学习大量材料。</strong></p>
        </div>
    </div>
    <!-- 核心功能 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(14,165,233,0.15);">
        <h2 style="color: #0ea5e9; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🚀 核心功能</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #6366f1; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">🎯 <strong>拥抱文档优先级</strong> - 可自行维护所有文档的优先级，作为漫游文档的推荐依据，可基于轮盘赌算法（优先级越高，推荐概率越大）或绝对优先级顺序（优先级数值高的必先被推荐）进行漫游</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #14b8a6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        🧠 <strong>智能推荐</strong> — 多锚点 TF-IDF 流程与侧边栏内联展示
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <h4 style="margin: 0 0 0.4em; color: #0f172a;">智能推荐设置</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li><strong>锚点</strong>：<code>recent_roam_N</code>、<code>top_roam_M</code></li>
                            <li><strong>结果</strong>：<code>topK</code> 推荐条数</li>
                            <li><strong>候选上限</strong>：<code>maxCandidates</code>（控制计算规模）</li>
                            <li><strong>采样段落上限</strong>：<code>maxParagraphs</code>（标题 + 头/中/尾）</li>
                        </ul>
                    </div>
                    <div style="margin-top: 0.8em;">
                        <h4 style="margin: 0 0 0.4em; color: #0f172a;">推荐算法流程</h4>
                        <ol style="margin: 0; padding-left: 1.2em;">
                            <li><strong>复用筛选</strong>：继承渐进阅读的笔记本/根/标签/SQL 过滤，保持范围一致。</li>
                            <li><strong>锚点选取</strong>：按 <code>custom-roaming-last</code> 取最近 N 篇，按 <code>custom-roaming-count</code> 取漫游次数最多 M 篇，合并去重。</li>
                            <li><strong>候选池</strong>：过滤后减掉锚点，按 <code>updated</code> 排序，数量不超过 <code>maxCandidates</code>。</li>
                            <li><strong>文本采样</strong>：标题 + 头/中/尾片段，数量受 <code>maxParagraphs</code> 限制，移除 Markdown 噪声。</li>
                            <li><strong>轻量分词</strong>：中文逐字、英文单词，停用词过滤。</li>
                            <li><strong>TF-IDF 向量</strong>：TF 长度归一化后乘以 IDF，稀疏 Map 存储。</li>
                            <li><strong>相似度</strong>：候选与各锚点做余弦，相似度取均值，降低单锚点噪声。</li>
                            <li><strong>展示与闭环</strong>：侧边栏按得分排序展示；点击打开文档并刷新指标/优先级，更新漫游/访问属性。</li>
                        </ol>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #8b5cf6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">⚖️ <strong>自定义指标权重</strong> - 用户可自定义文章难度、重要性、紧急程度等指标及权重</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #06b6d4; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📊 <strong>可视化优先级</strong> - 条带状点图清晰展示文档优先级，支持直接拖动调整</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #f59e0b; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📁 <strong>灵活筛选</strong> - 支持多选笔记本和根文档筛选，精准定位学习范围</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #ef4444; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📝 <strong>实时调整</strong> - 阅读过程中可实时调整文章指标，动态优化推荐算法</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #8b5cf6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📈 <strong>已漫游文档管理</strong> - 已漫游文档列表+热力图，支持批量调节优先级和拖动排序</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #6366f1; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📋 <strong>漫游历史追踪</strong> - 记录阅读历史、漫游次数和访问时间，追踪学习进度</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #10b981; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">🔄 <strong>自动重置</strong> - 支持每次开启思源时自动重置已访问文档记录</li>
        </ul>
    </div>
    <!-- 使用指南 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fefbff, #f3e8ff); border: 1px solid #c4b5fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(139,92,246,0.15);">
        <h2 style="color: #7c3aed; margin: 0 0 1em; text-align: center; font-size: 1.3em;">📖 使用指南</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📦 <strong>安装插件</strong> - 快速开始</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 在思源笔记插件市场中搜索"漫游式渐进阅读"<br>
                2. 点击安装按钮完成插件安装<br>
                3. 安装完成后，顶栏会出现插件图标
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">⚙️ <strong>设置参数</strong> - 自定义指标权重</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 右键点击顶栏插件图标进入设置页面<br>
                2. 自定义您需要的指标（如难度、重要性、紧急程度等）<br>
                3. 设置各指标的权重百分比<br>
                4. 选择要包含的笔记本或根文档<br>
                5. 设置绝对优先级顺序漫游参数（0-1之间）<br>
                6. 选择是否每次开启思源时自动重置已访问文档记录<br>
                7. 设置完成后点击保存
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📁 <strong>筛选设置</strong> - 精准定位</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 点击插件图标进入渐进学习面板
                2. 支持多选笔记本进行筛选，可自由组合<br>
                3. 支持选择根文档进行筛选<br>
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📊 <strong>调整指标</strong> - 动态优化</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 在阅读过程中，根据实际情况调整文章指标<br>
                2. 使用加减按钮调整各项指标值<br>
                3. 指标调整会实时影响文章的优先级计算<br>
                4. 您可以随时查看已漫游文档和所有文档优先级列表
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🎯 <strong>开始阅读</strong> - 根据优先级推荐</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 如果不想阅读该文章则直接“继续漫游”<br>
                2. 想阅读的话，可以直接阅读并简单编辑，点击"打开该文档"按钮可在新标签页打开文档，可以详细编辑，并进行摘录、制卡等操作
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🔄 <strong>继续漫游</strong> - 智能切换</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 当您对当前文章感到疲惫、遇到困难或想换换口味时<br>
                2. 点击"继续漫游"按钮<br>
                3. 系统会智能推荐下一篇文章<br>
                4. 实现无压力的"稍后阅读"体验
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📋 <strong>查看历史</strong> - 追踪进度</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 通过面板的已漫游文档列表查看漫游历史<br>
                2. 通过面板了解已阅读的文章、漫游次数和上次访问时间
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📊 <strong>可视化优先级管理</strong> - 条带状点图</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 通过条带状点图清晰查看所有文档的优先级分布<br>
                2. 点图中直接拖动调整文档优先级，相关指标会自动等比例变化<br>
                3. 右击点图中某点可在新标签页打开该文档<br>
                3. 文档优先级列表中可批量调节优先级<br>
                4. 文档优先级列表中支持拖动排序，优先级会自动变为前后两个文档的平均数
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🎲 <strong>混合推荐机制</strong> - 智能平衡</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 设置绝对优先级顺序漫游概率（0-1之间）<br>
                2. 设置为1：绝对按照优先级顺序先后漫游文档<br>
                3. 设置为0：完全按照优先级为权重概率的轮盘赌方式漫游<br>
                4. 设置为小数：有概率按优先级绝对顺序漫游，否则轮盘赌<br>
                5. 设置页面第三栏，您可以批量随机重置文档优先级，将指定优先级范围的文档重置为随机的新优先级值<br>
                6. 打开“智能推荐”，让多锚点 TF-IDF 推荐与混合漫游并行，获取更多候选文档
                </div>
                </details>
            </li>
        </ul>
    </div>
    <!-- 支持作者 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fef3f2, #fee2e2); border: 1px solid #fca5a5; border-radius: 8px; box-shadow: 0 4px 12px rgba(239,68,68,0.15);">
        <h2 style="color: #dc2626; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🫧 支持作者</h2>
        <p style="margin: 0.5em 0;">如果漫游式渐进阅读对您的学习有所帮助，欢迎给作者点个赞或打赏一杯咖啡，这将鼓励作者持续优化和开发更多实用功能：</p>
        <div style="margin: 1em 0; text-align: center;">
            <div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
                <div>
                    <img src="https://i0.hdslb.com/bfs/openplatform/12bb6dd415d52c76318b4fb391f179e69d263a54.png@1e_1c.webp"
                         alt="打赏二维码 - 核心代码和桌面端开发者"
                         style="width: 280px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="margin: 0.5em 0; color: #666;">核心代码和桌面端开发者<br>微信/支付宝</p>
                </div>
                <div>
                    <img src="https://i0.hdslb.com/bfs/openplatform/3b4d37a5285096d3493d09ca88280d9acf90129e.png@1e_1c.webp"
                         alt="打赏二维码 - 移动端开发者"
                         style="width: 280px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="margin: 0.5em 0; color: #666;">移动端开发者<br>微信/支付宝</p>
                </div>
            </div>
        </div>
    </div>
    <!-- 近期更新 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; border-radius: 8px; box-shadow: 0 4px 12px rgba(34,197,94,0.15);">
        <h2 style="color: #16a34a; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🚀 近期更新</h2>

<strong style="color: #6366f1; font-size: 1.1em;">📅 v4.1.0版本更新 (2025.11.23)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🌟 新功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 移动端浮窗一键漫游</strong>：点击紫色浮窗直接跳转随机文档，无需弹窗操作，提升流畅度。</li>
<li><strong>⚡ 跳转响应优化</strong>：移动端延迟从 300ms 优化到 100ms，操作更顺滑。</li>
<li><strong>🧭 筛选左右并排</strong>：筛选方式与筛选内容放在同一行，减少面板竖向占用。</li>
<li><strong>🗂 筛选历史</strong>：记录最近 10 次筛选（可钉住防覆盖），在筛选区域右上快速查看并一键应用。</li>
<li><strong>📊 漫游次数排序表</strong>：新增"漫游次数排序表"标签页，按漫游次数降序展示所有文档，支持刷新列表、点击打开文档、清0单个文档的漫游次数。</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 问题修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li>修复移动端浮窗点击无响应的问题，确保点击后可正确触发漫游并跳转。</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v4.0.1版本更新 (2025.11.22)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 移动端浮窗一键漫游</strong>：点击紫色浮窗直接跳转到随机文档，无需弹窗操作，提供更流畅的移动端体验</li>
<li><strong>⚡ 响应速度优化</strong>：将移动端跳转延迟从300ms优化到100ms，提升操作流畅度</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔧 移动端API修复</strong>：修复使用通用 <code>openTab</code> API 导致无法自动切换到新文档的问题，改用移动端专用 <code>openMobileFileById</code> API</li>
<li><strong>📱 浮窗响应修复</strong>：修复移动端浮窗点击无响应的问题，确保点击后能正确触发漫游并跳转</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v4.0.0版本更新 (2025.11.21)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 功能特性</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🪝 多锚点内容推荐</strong>：最近漫游 N 篇 + 漫游次数最多 M 篇作为锚点；TF-IDF + 余弦，多锚点取均值。</li>
<li><strong>🧾 长文智能采样</strong>：标题 + 头/中/尾分段并停用词过滤，避免长文稀释、内存暴涨。</li>
<li><strong>⚙️ 独立的智能推荐设置</strong>：可调锚点数量、Top K、候选上限、采样段落上限。</li>
<li><strong>🧊 侧边栏内联推荐</strong>：在“筛选与指标”底部直接展示，一键打开。</li>
<li><strong>🧮 点击推荐即计漫游</strong>：从推荐打开会刷新指标/优先级，并更新 <code>custom-roaming-last</code> / <code>custom-roaming-count</code> / <code>custom-visit-count</code>。</li>
<li><strong>🛡 SQL 安全</strong>：自动添加表别名，避免过滤条件引发列名歧义。</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.1.0版本更新 (2025.11.21)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 功能特性</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🧭 侧边栏漫游</strong>: 将专门的渐进阅读漫游页面改为侧边栏逻辑，可直接在源文档浏览和编辑</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>⚡ 优先级自动修复</strong>: 修复漫游时自动修复文档优先级效率低的问题</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.3版本更新 (2025.9.28)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 手机布局优化</strong>: 优化了手机布局，提升移动端使用体验</li>
<li><strong>🎯 浮动按钮优化</strong>: 浮动按钮优化，操作更加流畅</li>
<li><strong>📂 手机Tab支持</strong>: 手机支持直接打开tab，功能更完善</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>✏️ 编辑问题修复</strong>: 编辑问题修复，确保编辑功能正常运行</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.2版本更新 (2025.9.24)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔄 重复显示修复</strong>: 修复重复显示问题</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.1版本更新 (2025.9.24)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔍 SQL查询优化</strong>: 完善SQL查询筛选功能，查询多个文档，并附有常见语句提示</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 移动端显示修复</strong>: 修复移动端不能全屏显示问题，修复某些机型字体大小问题</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.0版本更新 (2025.9.15)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 移动端版本</strong>: 上线移动端版本，支持手机和平板设备</li>
<li><strong>⚡ 性能优化</strong>: 全面优化插件性能，提升响应速度和稳定性</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.3.0版本更新 (2025.9.14)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔒 编辑区锁定功能</strong>: 增加编辑区锁定功能，并可设置默认锁定/不锁定</li>
<li><strong>📋 根文档选择方式</strong>: 删除打开文档后点击插件图标按钮来漫游指定文档的方式，改为使用根文档选择的方式漫游指定文档</li>
<li><strong>🌳 文档树选择</strong>: 增强根文档筛选的功能。使用文档树选择文档，并保留直接输入ID方式</li>
<li><strong>🎨 图标更新</strong>: 更新插件按钮图标</li>
<li><strong>🏷️ 标签筛选</strong>: 增加基于标签的筛选功能</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔧 SQL查询修复</strong>: 修复自定义sql查询bug</li>
<li><strong>🔄 实时同步修复</strong>: 修复漫游页面编辑区不能实时更新同步的问题，确保外部编辑后编辑区显示内容能实时更新</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.2.0版本更新 (2025.7.17)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔧 优先级属性同步修复</strong>: 修复5种修改文档优先级方式无法立即改变文档priority属性的问题</li>
<li><strong>🔄 异步更新优化</strong>: 为所有优先级和指标调整方式添加了异步更新文档priority属性的功能</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🗑️ 数据清理功能</strong>: 增加清空所有文档指标和优先级数据功能，完全卸载插件前使用</li>
<li><strong>🧹 全面数据清理</strong>: 清空功能会删除文档优先级、文档指标、漫游记录和访问记录属性数据</li>
<li><strong>⚙️ 设置面板集成</strong>: 在设置面板批量优先级重置栏中新增清空数据按钮，支持进度显示和确认对话框</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.1.0版本更新 (2025.7.16)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📊 图表准确性修复</strong>: 修复点图中文档点与标度不符合的问题</li>
<li><strong>🔄 优先级列表修复</strong>: 修复优先级列表中调整优先级后出现的显示错误问题</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>⚖️ 精度提升</strong>: 修改优先级显示精度为小数点后两位，微调精度由0.1改为0.01，长按可快速调整</li>
<li><strong>🎲 批量重置</strong>: 增加批量随机重置文档优先级功能，将指定优先级范围的文档重置为随机的新优先级值</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.0.1版本更新 (2025.7.15)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📊 图表交互修复</strong>: 修复点图中红点拖动调整不跟手的问题</li>
<li><strong>🔄 优先级更新修复</strong>: 修复面板优先级调整后，点图红点不能及时更新的问题</li>
<li><strong>🎨 UI优化</strong>: 删除继续漫游后的大加载图标及颜色变化，移动到了"继续漫游"按钮上</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>⌨️ 快捷键</strong>: 增加快捷键，可方便快速开始漫游、继续漫游、重置已访问</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.0.0版本更新 (2025.7.12)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 重大更新</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎯 专注渐进阅读</strong>: 删除一遍过模式，只保留渐进阅读模式，专注核心功能</li>
<li><strong>📊 条带状点图</strong>: 新增条带状点图，更清晰看到文档的优先级情况，可随时拖动调整优先级</li>
<li><strong>⚖️ 直接优先级调整</strong>: 可直接调整优先级，相关联的文档指标会随之等比例变化</li>
<li><strong>📈 已漫游文档管理</strong>: 增加已漫游文档列表+热力图，可批量调节优先级情况，可拖动排序，优先级自动变为前后两个文档优先级平均数</li>
<li><strong>🎨 UI优化</strong>: 调整优化漫游面板UI，增加了漫游次数和上次访问时间</li>
<li><strong>🎲 混合推荐机制</strong>: 增加绝对优先级顺序漫游的功能，设置为1则绝对按照优先级顺序先后漫游文档，设置为0则完全按照优先级为权重概率的轮盘赌方式漫游，设置为小数则有概率按优先级绝对顺序漫游，否则轮盘赌</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.2.1版本更新 (2025.7.7)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔄 自动重置设置</strong>: 增加设置项：每次开启思源时自动重置已访问文档记录</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.2.0版本更新 (2025.7.6)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📄 特定文档打开</strong>: 针对特定文档，可以将其在渐进阅读页面打开，使用方法：先浏览该文档，再点击顶栏插件按钮即可跳转</li>
<li><strong>✏️ 编辑功能</strong>: 渐进阅读页面取消了只读，可简单编辑的功能</li>
<li><strong>⚡ 参数调整优化</strong>: 将指标参数加减按钮跨度由0.1改为了1，调整更便捷</li>
<li><strong>📁 多选笔记本</strong>: 笔记本选择可多选，可自由组合，更灵活的筛选方式</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.1.1版本更新 (2025.5.12)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 缺陷修复</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📊 文档计数修复</strong>: 修复了一遍过模式下显示剩余文档数量不正确的问题</li>
<li><strong>🔍 SQL模式优化</strong>: 优化了自定义SQL模式下的剩余文档数量计算方式</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.1.0版本更新 (2025.5.8)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 新增功能</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎯 算法稳定性提升</strong>: 提高了基于优先级的轮盘赌推荐算法稳定性</li>
<li><strong>💡 提示信息增强</strong>: 增加了计算概率时的提示信息</li>
<li><strong>⚙️ 设置页面优化</strong>: 更改了设置页面，右键顶栏插件图标即可进入设置页面</li>
<li><strong>📊 默认值设置</strong>: 设定了所有文档指标默认值为5</li>
<li><strong>🔄 批量更新</strong>: 修改指标信息时增加了为所有文档更新的动作，确保指标值不为0</li>
<li><strong>🔧 自动修正</strong>: 查看文档指标信息时，出现为0或者空值的指标，自动修正为默认值5</li>
<li><strong>📋 历史记录</strong>: 增加了漫游历史查看功能</li>
</ul>
</li>
</ul>
<details style="margin-top: 1.5em;">
<summary style="color: #666; cursor: pointer; font-weight: 500;">📋 查看历史更新</summary>
<div style="margin-top: 1em; padding-top: 1em; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.0.1版本更新 (2025.5.7)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #f59e0b;">✨ 功能改进</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎨 提示信息美化</strong>: 美化提示信息，增加诗意表达</li>
<li><strong>🔗 文档链接优化</strong>: 改进帮助文档链接，指向GitHub仓库中文文档</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.0.0版本更新 (2025.5.6)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 首个版本</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎯 渐进阅读核心</strong>: 首个可用的渐进阅读版本</li>
<li><strong>⚖️ 自定义指标</strong>: 添加用户自定义文章参数和权重</li>
<li><strong>📊 优先级计算</strong>: 基于参数计算优先级</li>
<li><strong>🎲 轮盘赌算法</strong>: 实现基于轮盘赌算法的文档推荐</li>
<li><strong>📁 筛选功能</strong>: 支持笔记本和根文档筛选</li>
<li><strong>🎲 随机模式</strong>: 支持完全随机的"一遍过"模式</li>
</ul>
</li>
</ul>

</div>
</details>
</div>
</div>
