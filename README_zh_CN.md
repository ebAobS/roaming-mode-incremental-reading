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
        <div style="color: rgba(255,255,255,0.9); margin-top: 0.5em; font-size: 1.1em;">渐进阅读完整步骤是：<br/>1 选择文档<br/>2 阅读，处理文档<br/>3 制作闪卡并记忆<br/>本插件专注第一步，不涉及第二步和第三步<br/><br/>旨在实现：<br/>随意，科学，快速地“刷文档”，新鲜度随时在线</div>
        <div style="margin-top: 1.5em; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/blob/main/CHANGELOG.md"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">🗓 更新日志</a>
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/issues"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">💬 问题反馈</a>
            <a href="https://ld246.com/article/1764136919240"
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
                <strong>讨论帖</strong>：<a href="https://ld246.com/article/1764136919240" style="color: #d97706;">漫游式渐进阅读 | 唯一能用的渐进阅读推荐解决方案</a>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>加入QQ交流群：1022747685</strong>  快到碗里来😏
            </li>
        </ul>
    </div>
    <!-- 核心功能 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(14,165,233,0.15);">
        <h2 style="color: #0ea5e9; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🚀 核心功能（点击条目可详细展开）</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #ec4899; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        💡 <strong>渐进阅读核心：稍后阅读</strong> — 并非对抗遗忘
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <p style="margin: 0.4em 0;">闪卡复习算法原理是遗忘曲线，这方面思源闪卡系统+FSRS算法已经足够完善。多年使用Anki、SuperMemo的经验表明，卡片的“最小信息原则”极其重要。</p>
                        <p style="margin: 0.4em 0;"><strong>渐进阅读</strong>面对的是大段文本，先天不符合“最小信息原则”。目前大多数渐进阅读解决方案惯性地使用遗忘曲线为原理的复习算法（如FSRS）来推荐复习文章，这并不合理。</p>
                        <p style="margin: 0.5em 0;line-height: 1.6;">对于一篇洋洋洒洒的文章，很难<strong>单纯的使用记忆程度</strong>作为下次是否<strong>被推荐复习的标准</strong>。真正的<strong>标准应该是多元</strong>的，比如难度、学习进度、学习内容的重要程度、紧急程度、感兴趣程度等。</p>
                        <p style="margin: 0.5em 0;line-height:1.6;"><strong>总之，渐进阅读的核心目的并不是"对抗遗忘"，而是实现无压力的"稍后阅读"，最终高效地同时学习大量材料。</strong></p>
                        <p style="margin: 0.5em 0;line-height:1.6;"><strong>本插件仅专注于解决稍后阅读的推荐问题，也就是优先级问题，至于后续的摘录制卡操作，本插件不涉及。</strong></p>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #6366f1; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        🎯 <strong>拥抱文档优先级</strong>详细可控可视化的优先级系统
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <p style="margin: 0.4em 0;">维护所有文档优先级，既可轮盘赌随机抽取（权重越高概率越大），也可绝对优先级顺序，兼容轻度与重度漫游习惯。</p>
                        <h4 style="margin: 0.8em 0 0.3em; color: #0f172a;">自定义指标权重</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>按需定义难度、重要性、紧急度、兴趣等指标，权重百分比完全自控。</li>
                            <li>指标变化将即时影响文档优先级，是推荐引擎的基础数据。</li>
                        </ul>
                        <h4 style="margin: 0.8em 0 0.3em; color: #0f172a;">灵活筛选</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>多笔记本 + 根文档联动筛选，范围控制更精细。</li>
                            <li>配合 SQL / 标签过滤，构建专属学习清单。</li>
                        </ul>
                        <h4 style="margin: 0.8em 0 0.3em; color: #0f172a;">可视化优先级</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>条带状点图直观展示优先级分布，可直接拖动节点，指标会按比例联动。</li>
                            <li>列表支持批量调节与拖动排序，快速做出整组调整。</li>
                        </ul>
                    </div>
                </details>
            </li>
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
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #0ea5e9; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        ⚙️ <strong>优先级进化管理</strong> — 手动实时 / 批量对齐
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <p style="margin: 0.4em 0;">提供“实时调整”和“优先级对齐”两套路径，按文档规模自由切换：</p>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li><strong>文档少 → 手动实时调整</strong>：阅读过程中即可修改各项指标或优先级，立刻体感推荐变化。</li>
                            <li><strong>文档多 → 优先级对齐</strong>：一键按照相关性百分比分布对齐被推荐文档，保留极值，适合批量维护。</li>
                        </ul>
                        <p style="margin: 0.4em 0;">无论采用哪种方式，目标都是持续演化优先级，保持推荐质量始终符合当前学习策略。</p>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #8b5cf6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        📈 <strong>漫游数据看板</strong> — 清楚掌握各种数据
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>优先级排序表：总览所有文档的优先级天梯榜，可拖动排序</li>
                            <li>已漫游文档列表：掌握已经看过的文档</li>
                            <li>漫游次数排序表：查看频繁访问的文档天梯榜，可清零访问次数。</li>
                        </ul>
                        <p style="margin: 0.4em 0;">清晰管理相关数据，随时掌握漫游策略执行情况。</p>
                    </div>
                </details>
            </li>
        </ul>
    </div>
    <!-- 使用指南 -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fefbff, #f3e8ff); border: 1px solid #c4b5fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(139,92,246,0.15);">
        <h2 style="color: #7c3aed; margin: 0 0 1em; text-align: center; font-size: 1.3em;">📖 使用指南（点击条目可详细展开）</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📦 <strong>安装插件</strong> - 快速开始</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 在思源笔记插件市场中搜索"漫游式渐进阅读"<br>
                2. 点击安装按钮完成插件安装<br>
                3. 安装完成后，顶栏和侧栏会出现插件图标
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">⚙️ <strong>初始化设置</strong> - 初始化指标权重等参数</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 右键点击顶栏插件图标进入设置页面<br>
                2. 设置绝对优先级顺序漫游概率（0-1之间）<br>
                ----2.1. 设置为1：绝对按照优先级顺序先后漫游文档<br>
                ----2.2. 设置为0：完全按照优先级为权重概率的轮盘赌方式漫游<br>
                ----2.3. 设置为小数：有概率按优先级绝对顺序漫游，否则轮盘赌<br>
                3. 选择是否排除已访问文档，自动重载漫游，自动重置已访问文档记录<br>
                4. 自定义您需要的指标以及各指标的权重百分比，<strong>点击保存，耐心等待初始化完毕，第一次可能时间较长</strong><br>
                5. 配置基准文档的选择以及候选与输出参数，自行平衡推荐质量与计算时间
                6. 开启或关闭“自动优先级对齐”选项，开启则快速迭代优先级，关闭而采用手动对齐则更准确<br>
                7. 设置完成后点击保存
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📁 <strong>筛选文档</strong> - 选定范围</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 侧栏进入渐进学习面板<br>
                2. 支持多选笔记本进行筛选，可自由组合<br>
                3. 支持选择根文档、标签等方式进行筛选<br>
                4. 支持自定义SQL的方式进行个性化定制筛选<br>
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📊 <strong>阅读与调整</strong> - 核心步骤</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 在阅读过程中，<strong>根据实际情况调整文章指标、优先级</strong><br>
                2. 如果文档并不是你想看的，则调低<br>
                3. 如果是你想看的，或者很重要，希望多被推荐，则调高<br>
                4. 进行文档内容的学习、理解、摘录、制卡<br>
                5. 看不完或者看累了，立即点击继续漫游进入下一篇文章，<strong>不要硬着头皮读，无压力的稍后阅读，正是渐进阅读的精髓</strong><br>
                6.对于新文章重复上述过程
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🎲 <strong>智能推荐&优先级对齐</strong> - 无压力、不耗时、高效的进化迭代文档优先级</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                <strong>1. 智能推荐，基于您最近的偏好文档（优先级高或浏览次数多）内容，推荐与其相似的其他文档</strong><br>
                ----1.1. 选定您认为优先级最高的多少篇，以及浏览次数最多的多少篇作为基准文档合适？力求能反映您的偏好<br>
                ----1.2. 选定多少显示多少文档，多少文档参与候选，多少段落参与采样。<strong>通常数值越大，推荐越准确，但同时计算量增加，耗时增加</strong><br>
                ----1.3. 自行调整参数，将推荐的准确度与加载性能之间做一个平衡<br>
                <strong>2. 优先级对齐，将智能推荐的文档的优先级数值分布调整为与相关性百分比值的分布一致，并保持极值不变</strong><br>
                ----2.1. 调整方法大致为将相关性值<strong>归一化，再反归一化</strong>为优先级的值。<br>
                ----2.2. 如果您的思源的文档<strong>数量极多</strong>，这个功能可大大<strong>加快</strong>您对众多文档的<strong>优先级管理</strong>。<br>
                ----2.3. <strong>每次对齐，都是对您文档优先级分布的一次反馈，也是一次进化，不断进化不断迭代，形成“自回归”式的优先级管理，同时您也节省了时间和精力</strong>
                ----2.4. 可选设置开启自动优先级对齐，适合需要快速高效笼统的将优先级分布分化的情况
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📋 <strong>数据管理与可视化</strong> - 清晰查看阅读的相关数据</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. 通过面板了解漫游次数和上次访问时间<br>
                2. 通过条带状点图清晰查看所有文档的优先级分布<br>
                3. 点图中直接拖动调整文档优先级，相关指标会自动等比例变化<br>
                4. 右击点图中某点可在新标签页打开该文档<br>
                5. 通过面板的其他tab，如优先级排序表，已漫游文档列表，漫游次数排序表等，查看和了解相关数据<br>
                6. 文档优先级列表中支持拖动排序，优先级会自动变为前后两个文档的平均数
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
</div>

