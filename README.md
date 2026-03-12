<div class="sy__outline" style="max-width: 800px; margin: 0 auto;">
    <style>
        .sy__outline {
            font-family: "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
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
        <h1 style="color: white; margin: 0; font-size: 2.2em;">📚 Roaming Mode Incremental Reading</h1>
        <div style="color: rgba(255,255,255,0.9); margin-top: 0.5em; font-size: 1.1em;">The complete incremental reading workflow is:<br/>1 Select documents<br/>2 Read and process documents<br/>3 Create flashcards and memorize<br/>This plugin focuses on step 1 only and does not cover steps 2 and 3<br/><br/>Goal:<br/>Browse documents casually, scientifically, and quickly, while always keeping content freshness high</div>
        <div style="margin-top: 1.5em; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/blob/main/CHANGELOG.md"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">🗓 Changelog</a>
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/issues"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">💬 Feedback</a>
            <a href="https://ld246.com/article/1764136919240"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">📖 Discussion</a>
        </div>
    </div>
    <!-- Project Information -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fbbf24; border-radius: 8px; box-shadow: 0 4px 12px rgba(245,158,11,0.15);">
        <h2 style="color: #d97706; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🤝 Project Information</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>Repository</strong>: <a href="https://github.com/ebAobS/roaming-mode-incremental-reading" style="color: #d97706;">GitHub Repository</a>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>Discussion</strong>: <a href="https://ld246.com/article/1764136919240" style="color: #d97706;">Roaming Mode Incremental Reading | The Only Usable Incremental Reading Recommendation Solution</a>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>Join the QQ group: 1022747685</strong> — hop in and say hi 😏
            </li>
        </ul>
    </div>
    <!-- Core Features -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(14,165,233,0.15);">
        <h2 style="color: #0ea5e9; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🚀 Core Features (Click the item to expand for details)</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #ec4899; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        💡 <strong>Incremental Reading Core: Read Later</strong> — Not Fighting Forgetting
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <p style="margin: 0.4em 0;">Flashcard review algorithms are based on the forgetting curve, and the SiYuan flashcard system + FSRS algorithm is already mature. Years of experience with Anki and SuperMemo show that the "minimum information principle" is crucial for cards.</p>
                        <p style="margin: 0.4em 0;"><strong>Incremental reading</strong> deals with large text blocks, which inherently do not fit the "minimum information principle". Most current incremental reading solutions habitually use forgetting curve-based review algorithms (like FSRS) to recommend articles for review, which is not reasonable.</p>
                        <p style="margin: 0.5em 0;line-height: 1.6;">For a long article, it is difficult to <strong>use only memory level</strong> as the standard for whether it should <strong>be recommended for review next time</strong>. The real <strong>criteria should be multi-dimensional</strong>, such as difficulty, learning progress, importance, urgency, interest, etc.</p>
                        <p style="margin: 0.5em 0;line-height:1.6;"><strong>In short, the core purpose of incremental reading is not to "fight forgetting", but to achieve a stress-free "read later" experience, and ultimately to efficiently learn a large amount of material simultaneously.</strong></p>
                        <p style="margin: 0.5em 0;line-height:1.6;"><strong>This plugin focuses solely on solving the recommendation problem for "read later", which is the priority problem. As for subsequent excerpting and card-making operations, this plugin does not cover them.</strong></p>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #6366f1; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        🎯 <strong>Embrace Document Priority</strong> — Detailed, Controllable, Visualizable Priority System
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <p style="margin: 0.4em 0;">Maintain all document priorities, supporting both roulette random selection (higher priority → higher probability) and absolute priority ordering, compatible with light and heavy roaming habits.</p>
                        <h4 style="margin: 0.8em 0 0.3em; color: #0f172a;">Custom Metric Weights</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>Define metrics like difficulty, importance, urgency, interest, etc., with fully customizable weight percentages.</li>
                            <li>Metric changes will immediately affect document priorities, serving as the foundation for the recommendation engine.</li>
                        </ul>
                        <h4 style="margin: 0.8em 0 0.3em; color: #0f172a;">Flexible Filtering</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>Multi-notebook + root document combined filtering for more precise scope control.</li>
                            <li>Combine with SQL / tag filtering to build your personalized learning list.</li>
                        </ul>
                        <h4 style="margin: 0.8em 0 0.3em; color: #0f172a;">Visualized Priorities</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>Strip dot chart intuitively displays priority distribution, supports direct drag adjustment of nodes, with metrics changing proportionally.</li>
                            <li>List supports batch adjustment and drag sorting for quick group adjustments.</li>
                        </ul>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #14b8a6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        🧠 <strong>Intelligent Recommendation</strong> — Multi-anchor TF-IDF pipeline with inline sidebar output
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <h4 style="margin: 0 0 0.4em; color: #0f172a;">Intelligent Recommendation Settings</h4>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li><strong>Anchors</strong>: <code>recent_roam_N</code>, <code>top_roam_M</code></li>
                            <li><strong>Results</strong>: <code>topK</code> recommendations</li>
                            <li><strong>Candidate Limit</strong>: <code>maxCandidates</code> to cap computation scale</li>
                            <li><strong>Sampling Paragraph Cap</strong>: <code>maxParagraphs</code> (title + head/mid/tail)</li>
                        </ul>
                    </div>
                    <div style="margin-top: 0.8em;">
                        <h4 style="margin: 0 0 0.4em; color: #0f172a;">Recommendation Pipeline</h4>
                        <ol style="margin: 0; padding-left: 1.2em;">
                            <li><strong>Reuse filtering</strong>: inherit notebook/root/tag/SQL filters from incremental reading.</li>
                            <li><strong>Anchor selection</strong>: pick recent N via <code>custom-roaming-last</code> and top M via <code>custom-roaming-count</code>, then dedupe.</li>
                            <li><strong>Candidate pool</strong>: subtract anchors, sort by <code>updated</code>, keep within <code>maxCandidates</code>.</li>
                            <li><strong>Text sampling</strong>: title + head/mid/tail snippets, limited by <code>maxParagraphs</code>, strip Markdown noise.</li>
                            <li><strong>Lightweight tokenization</strong>: per-character Chinese, per-word English, remove stop words.</li>
                            <li><strong>TF-IDF vectors</strong>: length-normalized TF times IDF, stored as sparse maps.</li>
                            <li><strong>Similarity</strong>: compute cosine against every anchor, average scores to reduce single-anchor noise.</li>
                            <li><strong>Display & feedback loop</strong>: sidebar ranks by score; opening a recommendation refreshes metrics/priority and updates roaming/access attributes.</li>
                        </ol>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #0ea5e9; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        ⚙️ <strong>Priority Evolution Management</strong> — Manual Real-time / Batch Alignment
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <p style="margin: 0.4em 0;">Provides two paths: "real-time adjustment" and "priority alignment", switch freely based on document scale:</p>
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li><strong>Few documents → Manual real-time adjustment</strong>: Modify metrics or priorities during reading, immediately feel the recommendation changes.</li>
                            <li><strong>Many documents → Priority alignment</strong>: One-click alignment of recommended documents according to relevance percentage distribution, preserving extremes, suitable for batch maintenance.</li>
                        </ul>
                        <p style="margin: 0.4em 0;">Regardless of which method is used, the goal is to continuously evolve priorities, keeping recommendation quality aligned with current learning strategy.</p>
                    </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #8b5cf6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">
                <details>
                    <summary style="color: #0f172a; cursor: pointer; font-weight: 600; font-size: 1.05em;">
                        📈 <strong>Roaming Data Dashboard</strong> — Clear Overview of All Data
                    </summary>
                    <div style="margin-top: 0.8em;">
                        <ul style="margin: 0; padding-left: 1.2em; list-style: disc;">
                            <li>Priority Sort Table: Overview of all documents' priority leaderboard, supports drag sorting</li>
                            <li>Roamed Document List: Track documents you've already read</li>
                            <li>Roaming Count Sort Table: View frequently accessed documents leaderboard, supports resetting access counts.</li>
                        </ul>
                        <p style="margin: 0.4em 0;">Clearly manage related data, always stay informed about roaming strategy execution.</p>
                    </div>
                </details>
            </li>
        </ul>
    </div>
    <!-- User Guide -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fefbff, #f3e8ff); border: 1px solid #c4b5fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(139,92,246,0.15);">
        <h2 style="color: #7c3aed; margin: 0 0 1em; text-align: center; font-size: 1.3em;">📖 User Guide (Click the item to expand for details)</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📦 <strong>Install Plugin</strong> - Quick Start</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Search for "Roaming Mode Incremental Reading" in the SiYuan plugin marketplace<br>
                2. Click the install button to complete installation<br>
                3. After installation, the plugin icon will appear in the top bar and sidebar
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">⚙️ <strong>Initialization Settings</strong> - Configure metric weights and core parameters</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Right-click the top-bar plugin icon to open the settings page<br>
                2. Configure the absolute-priority roaming probability (0–1)<br>
                ----2.1. Set to 1: roam strictly in absolute priority order<br>
                ----2.2. Set to 0: fully rely on roulette probability with priority as the weight<br>
                ----2.3. Set to any decimal between 0 and 1: sometimes follow absolute order, otherwise roulette<br>
                3. Choose whether to exclude visited docs, auto-reload roaming, and auto-reset visited records<br>
                4. Define the metrics you need and each weight percentage. <strong>Click Save and wait for initialization; the very first run can take a while.</strong><br>
                5. Configure baseline document selection plus candidate/output parameters to balance accuracy and compute time<br>
                6. Decide whether to turn on “Auto Priority Alignment”: enable for rapid iteration, disable for finer manual control<br>
                7. Click Save after everything is set
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📁 <strong>Filter Documents</strong> - Select Scope</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Enter the incremental learning panel from the sidebar<br>
                2. Support multi-select notebooks for filtering, combine freely<br>
                3. Support selecting root documents, tags, and other filtering methods<br>
                4. Support custom SQL for personalized filtering<br>
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📊 <strong>Reading and Adjustment</strong> - Core Steps</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. During reading, adjust article metrics and priorities based on actual situation<br>
                2. If the document is not what you want to read, lower it<br>
                3. If it's what you want to read, or it's important and you want it recommended more, raise it<br>
                4. Study, understand, excerpt, and make cards from the document content<br>
                5. If you can't finish or get tired, immediately click "Continue Roaming" to move to the next article. Don't force yourself—stress-free "read later" is the essence of incremental reading<br>
                6. Repeat the above process for new articles
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🎲 <strong>Intelligent Recommendation & Priority Alignment</strong> - Stress-free, efficient priority evolution</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                <strong>1. Intelligent recommendation</strong>: Uses your recent preference anchors (high-priority or frequently roamed documents) to surface similar documents<br>
                ----1.1. Decide how many top-priority docs and how many high-roaming-count docs become baseline anchors so the system reflects your taste<br>
                ----1.2. Choose how many documents to display, how many join the candidate pool, and how many paragraphs to sample. Larger numbers raise accuracy but add computation time<br>
                ----1.3. Tune the parameters until you strike the accuracy vs. performance balance that feels right<br>
                <strong>2. Priority alignment</strong>: Re-shapes recommended document priorities to match their relevance-percentage distribution while keeping the extreme values untouched<br>
                ----2.1. In practice it normalizes the similarity scores, then maps them back (denormalizes) into the priority range<br>
                ----2.2. For massive libraries, this dramatically accelerates large-scale priority maintenance<br>
                ----2.3. Every alignment pass is a feedback loop that evolves your priority distribution—think self-regressing management that saves time and effort<br>
                ----2.4. You can enable auto priority alignment when you need a fast, coarse-grained priority reshuffle
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📋 <strong>Data Management and Visualization</strong> - Clear View of Reading-Related Data</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Understand roaming count and last access time through the panel<br>
                2. Clearly view all document priority distribution through the strip dot chart<br>
                3. Directly drag to adjust document priorities in the chart, related metrics will change proportionally<br>
                4. Right-click a point in the chart to open that document in a new tab<br>
                5. View and understand related data through other tabs in the panel, such as priority sort table, roamed document list, roaming count sort table, etc.<br>
                6. Support drag sorting in document priority list, priority automatically becomes the average of the two adjacent documents
                </div>
                </details>
            </li>
        </ul>
    </div>
    <!-- Support the Author -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fef3f2, #fee2e2); border: 1px solid #fca5a5; border-radius: 8px; box-shadow: 0 4px 12px rgba(239,68,68,0.15);">
        <h2 style="color: #dc2626; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🫧 Support the Author</h2>
        <p style="margin: 0.5em 0;">If Roaming Mode Incremental Reading helps your learning, please consider giving a like or buying a coffee. This encourages the author to keep optimizing and developing more useful features:</p>
        <div style="margin: 1em 0; text-align: center;">
            <div style="display: flex; justify-content: center; gap: 2em; flex-wrap: wrap;">
                <div>
                    <img src="https://i0.hdslb.com/bfs/openplatform/12bb6dd415d52c76318b4fb391f179e69d263a54.png@1e_1c.webp"
                         alt="Donation QR Code - Core Code and Desktop Developer"
                         style="width: 280px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="margin: 0.5em 0; color: #666;">Core Code and Desktop Developer<br>WeChat/Alipay</p>
                </div>
                <div>
                    <img src="https://i0.hdslb.com/bfs/openplatform/3b4d37a5285096d3493d09ca88280d9acf90129e.png@1e_1c.webp"
                         alt="Donation QR Code - Mobile Developer"
                         style="width: 280px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="margin: 0.5em 0; color: #666;">Mobile Developer<br>WeChat/Alipay</p>
                </div>
            </div>
        </div>
    </div>
</div>

