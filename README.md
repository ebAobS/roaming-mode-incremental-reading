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
        <div style="color: rgba(255,255,255,0.9); margin-top: 0.5em; font-size: 1.1em;">An incremental reading plugin powered by intelligent recommendation algorithms, delivering a stress-free "read later" learning experience</div>
        <div style="margin-top: 1.5em; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/blob/main/CHANGELOG.md"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">🗓 Changelog</a>
            <a href="https://github.com/ebAobS/roaming-mode-incremental-reading/issues"
               style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border-radius: 6px; text-decoration: none; font-size: 0.9em;">💬 Feedback</a>
            <a href="https://ld246.com/article/1746802777105"
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
                <strong>Discussion</strong>: <a href="https://ld246.com/article/1746802777105" style="color: #d97706;">Roaming Mode Incremental Reading | The Only Usable Incremental Reading Recommendation Solution</a>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 4px rgba(245,158,11,0.08);">
                <strong>Contact</strong>: WeChat ebAobS, welcome to join the user group
            </li>
        </ul>
    </div>
    <!-- Core Philosophy -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fef7ff, #fdf2f8); border: 1px solid #f9a8d4; border-radius: 8px; box-shadow: 0 4px 12px rgba(236,72,153,0.15);">
        <h2 style="color: #be185d; margin: 0 0 1em; text-align: center; font-size: 1.3em;">💡 Core Philosophy</h2>
        <div style="background: white; padding: 1.5em; border-radius: 8px; border-left: 4px solid #ec4899;">
            <p style="margin: 0.5em 0; line-height: 1.6;"><strong>Incremental reading should be distinguished from flashcards:</strong></p>
            <ul style="margin: 0.5em 0; padding-left: 1.2em;">
                <li style="margin: 0.3em 0;"><strong>Flashcards</strong> are based on the <strong>forgetting curve</strong>. The SiYuan flashcard system + FSRS algorithm is already mature. Years of using Anki and SuperMemo show that the "minimum information principle" is crucial for cards.</li>
                <li style="margin: 0.3em 0;"><strong>Incremental reading</strong> deals with large text blocks, which inherently do not fit the "minimum information principle". Most current solutions still use forgetting curve-based algorithms (like FSRS) for article review, which is not reasonable.</li>
            </ul>
            <p style="margin: 0.5em 0; line-height: 1.6;">For a long article, it is difficult to <strong>use only memory level</strong> as the standard for whether it should <strong>be recommended for review next time</strong>. The real <strong>criteria should be multi-dimensional</strong>, such as difficulty, progress, importance, urgency, interest, etc.</p>
            <p style="margin: 0.5em 0; line-height: 1.6;"><strong>In short, the core purpose of incremental reading is not to "fight forgetting", but to achieve a stress-free "read later" experience, and ultimately to efficiently learn a large amount of material simultaneously.</strong></p>
        </div>
    </div>
    <!-- Core Features -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #bae6fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(14,165,233,0.15);">
        <h2 style="color: #0ea5e9; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🚀 Core Features</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #6366f1; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">🎯 <strong>Embrace Document Priority</strong> - Maintain document priorities yourself and use them as the roaming recommendation source, based on roulette (higher priority → higher probability) or absolute ordering (always pick the highest priority first)</li>
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
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #8b5cf6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">⚖️ <strong>Customizable Metric Weights</strong> - Users can define metrics like difficulty, importance, urgency, and set their weights</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #06b6d4; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📊 <strong>Visualized Priorities</strong> - Strip dot chart clearly shows document priorities, supports direct drag adjustment</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #f59e0b; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📁 <strong>Flexible Filtering</strong> - Multi-select notebooks and root documents for precise learning scope</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #ef4444; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📝 <strong>Real-time Adjustment</strong> - Adjust article metrics in real time during reading, dynamically optimize recommendations</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #8b5cf6; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📈 <strong>Roamed Document Management</strong> - Roamed document list + heatmap, batch adjust priorities, drag to sort</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #6366f1; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">📋 <strong>Roaming History Tracking</strong> - Record reading history, roaming count, and access time to track progress</li>
            <li style="margin: 0.5em 0; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; border-left: 4px solid #10b981; color: #0f172a; box-shadow: 0 6px 18px rgba(15,23,42,0.05);">🔄 <strong>Auto Reset</strong> - Optionally auto-reset visited document records each time SiYuan starts</li>
        </ul>
    </div>
    <!-- User Guide -->
    <div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #fefbff, #f3e8ff); border: 1px solid #c4b5fd; border-radius: 8px; box-shadow: 0 4px 12px rgba(139,92,246,0.15);">
        <h2 style="color: #7c3aed; margin: 0 0 1em; text-align: center; font-size: 1.3em;">📖 User Guide</h2>
        <ul style="margin: 0; padding-left: 1.2em;">
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📦 <strong>Install Plugin</strong> - Quick Start</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Search for "Roaming Mode Incremental Reading" in the SiYuan plugin marketplace<br>
                2. Click the install button to complete installation<br>
                3. After installation, the plugin icon will appear in the top bar
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">⚙️ <strong>Set Parameters</strong> - Custom Metric Weights</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Right-click the top bar plugin icon to enter settings<br>
                2. Customize metrics (difficulty, importance, urgency, etc.)<br>
                3. Set weights for each metric<br>
                4. Select notebooks or root documents to include<br>
                5. Set the absolute priority order roaming parameter (0-1)<br>
                6. Choose whether to auto-reset visited document records on SiYuan startup<br>
                7. Click save when done
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📁 <strong>Filter Settings</strong> - Precise Targeting</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Click the plugin icon to open the incremental reading panel<br>
                2. Multi-select notebooks for filtering, combine freely<br>
                3. Select root documents for filtering<br>
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📊 <strong>Adjust Metrics</strong> - Dynamic Optimization</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Adjust article metrics during reading as needed<br>
                2. Use plus/minus buttons to change metric values<br>
                3. Adjustments instantly affect priority calculation<br>
                4. You can always view roamed documents and all document priorities
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🎯 <strong>Start Reading</strong> - Priority-based Recommendation</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. If you don't want to read the current article, just "Continue Roaming"<br>
                2. If you want to read, you can read and simply edit, or click "Open Document" to open in a new tab for detailed editing, excerpting, card making, etc.
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🔄 <strong>Continue Roaming</strong> - Intelligent Switching</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. When you feel tired, encounter difficulties, or want a change<br>
                2. Click "Continue Roaming"<br>
                3. The system will intelligently recommend the next article<br>
                4. Enjoy a stress-free "read later" experience
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📋 <strong>View History</strong> - Track Progress</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. View roaming history in the roamed document list<br>
                2. See read articles, roaming count, and last access time
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">📊 <strong>Visual Priority Management</strong> - Strip Dot Chart</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Clearly view all document priorities in the strip dot chart<br>
                2. Drag dots to adjust priorities, related metrics change proportionally<br>
                3. Right-click a dot to open the document in a new tab<br>
                4. Batch adjust priorities in the list<br>
                5. Drag to sort in the list, priority becomes the average of adjacent documents
                </div>
                </details>
            </li>
            <li style="margin: 0.5em 0; padding: 10px 14px; background: white; border-radius: 8px; border-left: 4px solid #0369a1; box-shadow: 0 2px 4px rgba(124,58,237,0.08);">
                <details>
                <summary style="color: #0369a1; cursor: pointer; font-weight: 500; font-size: 1.05em;">🎲 <strong>Hybrid Recommendation Mechanism</strong> - Smart Balance</summary>
                <div style="margin-top: 0.8em; padding-top: 0.8em; border-top: 1px solid #f3e8ff;">
                1. Set the absolute priority order roaming probability (0-1)<br>
                2. Set to 1: strictly roam in priority order<br>
                3. Set to 0: fully use roulette wheel by priority as weight<br>
                4. Set to decimal: sometimes roam by order, otherwise roulette wheel<br>
                5. In the settings panel, you can batch reset priorities randomly for documents within a specified range<br>
                6. Enable intelligent recommendation to surface multi-anchor TF-IDF suggestions alongside hybrid roaming for richer choices
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
    <!-- Recent Updates -->
<div style="margin-top: 1.5em; padding: 1.5em; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; border-radius: 8px; box-shadow: 0 4px 12px rgba(34,197,94,0.15);">
        <h2 style="color: #16a34a; margin: 0 0 1em; text-align: center; font-size: 1.3em;">🚀 Recent Updates</h2>

<strong style="color: #6366f1; font-size: 1.1em;">📅 v4.1.0 Update (2025.11.23)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🌟 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 Mobile one-tap roaming</strong>: Tap the purple floating button to jump directly to a random document without extra dialogs for smoother mobile flow.</li>
<li><strong>⚡ Faster mobile jump</strong>: Reduced delay from 300ms to 100ms to improve responsiveness.</li>
<li><strong>🧭 Side-by-side filters</strong>: Filter mode and filter content now share one row, saving vertical space.</li>
<li><strong>🗂 Filter history</strong>: Keeps the latest 10 filter choices, supports pinning to avoid overwriting, and can be applied quickly from the filter header.</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li>Fixed mobile floating button tap not responding, ensuring roaming triggers and navigation correctly.</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v4.0.1 Update (2025.11.22)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 Mobile One-tap Roaming</strong>: Tap the purple floating button to jump directly to a random document without opening a dialog, providing a smoother mobile experience</li>
<li><strong>⚡ Response Speed Optimization</strong>: Reduced mobile jump delay from 300ms to 100ms for improved fluency</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔧 Mobile API Fix</strong>: Fixed issue where using the generic <code>openTab</code> API prevented automatic switching to new documents; now uses mobile-specific <code>openMobileFileById</code> API</li>
<li><strong>📱 Floating Button Response Fix</strong>: Fixed unresponsive mobile floating button issue, ensuring proper roaming trigger and navigation after tap</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v4.0.0 Update (2025.11.21)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🪝 Multi-anchor recommendation</strong>: use the latest N roamed notes plus the top M most roamed notes as anchors; TF-IDF + cosine similarity, averaging scores across anchors.</li>
<li><strong>🧾 Long-form smart sampling</strong>: title + head/mid/tail sampling with stop-word filtering to avoid diluted signals and memory spikes.</li>
<li><strong>⚙️ Dedicated recommendation settings</strong>: adjustable anchor counts, Top K, candidate cap, and sampled paragraph limits.</li>
<li><strong>🧊 Inline sidebar suggestions</strong>: surface recommendations right under “Filters & Metrics” with one-click open.</li>
<li><strong>🧮 Click-to-roam updates</strong>: opening from recommendations refreshes metrics/priority and updates <code>custom-roaming-last</code> / <code>custom-roaming-count</code> / <code>custom-visit-count</code>.</li>
<li><strong>🛡 SQL safety</strong>: auto-apply table aliases to prevent ambiguous column errors in filters.</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.1.0 Update (2025.11.21)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🧭 Sidebar-first roaming</strong>: The dedicated incremental reading roam page is now integrated into the sidebar, so you can browse and edit directly in the source document</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>⚡ Priority auto-repair</strong>: Improved efficiency when auto-fixing document priorities during roaming</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.3 Update (2025.9.28)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 Mobile Layout Optimization</strong>: Optimized mobile layout for better mobile user experience</li>
<li><strong>🎯 Floating Button Enhancement</strong>: Enhanced floating buttons for smoother operation</li>
<li><strong>📂 Mobile Tab Support</strong>: Mobile devices now support direct tab opening for more complete functionality</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>✏️ Editing Issues Fixed</strong>: Fixed editing issues to ensure proper editing functionality</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.2 Update (2025.9.24)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔄 Duplicate Display Fix</strong>: Fixed duplicate display issues</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.1 Update (2025.9.24)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔍 SQL Query Enhancement</strong>: Enhanced SQL query filtering functionality, query multiple documents with common statement hints</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 Mobile Display Fix</strong>: Fixed mobile full-screen display issues and font size problems on certain device models</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v3.0.0 Update (2025.9.15)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📱 Mobile Version</strong>: Launched mobile version supporting phones and tablets</li>
<li><strong>⚡ Performance Optimization</strong>: Comprehensive plugin performance optimization, improved response speed and stability</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.3.0 Update (2025.9.14)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔒 Editor Lock Function</strong>: Added editor lock functionality with configurable default lock/unlock settings</li>
<li><strong>📋 Root Document Selection</strong>: Removed the method of clicking plugin icon after opening document to roam specified documents, replaced with root document selection approach</li>
<li><strong>🌳 Enhanced Document Tree</strong>: Enhanced root document filtering functionality using document tree selection while maintaining direct ID input method</li>
<li><strong>🎨 Icon Update</strong>: Updated plugin button icon</li>
<li><strong>🏷️ Tag-based Filtering</strong>: Added tag-based filtering functionality</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔧 SQL Query Fix</strong>: Fixed custom SQL query bugs</li>
<li><strong>🔄 Real-time Sync Fix</strong>: Fixed issue where roaming page editor couldn't update in real-time, ensuring editor content updates immediately after external edits</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.2.0 Update (2025.7.17)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔧 Priority Attribute Sync Fix</strong>: Fixed issue where 5 methods of modifying document priority couldn't immediately change document priority attributes</li>
<li><strong>🔄 Async Update Optimization</strong>: Added async update functionality for document priority attributes to all priority and metric adjustment methods</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🗑️ Data Cleanup Function</strong>: Added function to clear all document metrics and priority data, use before completely uninstalling the plugin</li>
<li><strong>🧹 Comprehensive Data Cleanup</strong>: Clear function removes document priority, metrics, roaming records and visit count attribute data</li>
<li><strong>⚙️ Settings Panel Integration</strong>: Added clear data button in batch priority reset section of settings panel with progress display and confirmation dialog</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.1.0 Update (2025.7.16)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📊 Chart Accuracy Fix</strong>: Fixed issue with document dots not matching scale in charts</li>
<li><strong>🔄 Priority List Fix</strong>: Fixed display errors after adjusting priorities in priority lists</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>⚖️ Precision Improvement</strong>: Modified priority display precision to two decimal places and fine-tuning precision from 0.1 to 0.01, with long press for quick adjustment</li>
<li><strong>🎲 Batch Reset</strong>: Added batch random document priority reset feature, resetting documents within specified priority range to new random priority values</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.0.1 Update (2025.7.15)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📊 Chart Interaction Fix</strong>: Fixed issue with red dot drag adjustment not following in dot chart</li>
<li><strong>🔄 Priority Update Fix</strong>: Fixed issue where priority panel adjustments don't immediately update chart's red dots</li>
<li><strong>🎨 UI Improvement</strong>: Removed large loading icon after continuing roaming, moved to "Continue Roaming" button</li>
</ul>
</li>
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Feature</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>⌨️ Keyboard Shortcuts</strong>: Added shortcuts for quickly starting roaming, continuing roaming, and resetting visited pages</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v2.0.0 Update (2025.7.12)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 Major Update</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎯 Focus on Incremental Reading</strong>: Removed one-time mode, keeping only incremental reading mode for core functionality</li>
<li><strong>📊 Strip Chart</strong>: Added strip chart for clearer visualization of document priorities with drag adjustment</li>
<li><strong>⚖️ Direct Priority Adjustment</strong>: Directly adjust priorities with proportional changes to related document metrics</li>
<li><strong>📈 Roamed Document Management</strong>: Added roamed document list + heatmap with batch priority adjustment and drag sorting</li>
<li><strong>🎨 UI Optimization</strong>: Adjusted and optimized roaming panel UI with roaming count and last access time</li>
<li><strong>🎲 Hybrid Recommendation Mechanism</strong>: Added absolute priority order roaming functionality</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.2.1 Update (2025.7.7)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Feature</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🔄 Auto Reset Setting</strong>: Added setting to automatically reset visited document records when starting SiYuan</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.2.0 Update (2025.7.6)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📄 Specific Document Opening</strong>: For specific documents, can open them in incremental reading page</li>
<li><strong>✏️ Editing Function</strong>: Removed read-only mode from incremental reading page, allowing simple editing</li>
<li><strong>⚡ Parameter Adjustment Optimization</strong>: Changed metric parameter adjustment step from 0.1 to 1 for easier adjustment</li>
<li><strong>📁 Multi-select Notebooks</strong>: Notebook selection supports multi-select for flexible filtering</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.1.1 Update (2025.5.12)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #ef4444;">🐛 Bug Fixes</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>📊 Document Count Fix</strong>: Fixed incorrect remaining document count display in one-time mode</li>
<li><strong>🔍 SQL Mode Optimization</strong>: Optimized remaining document count calculation in custom SQL mode</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.1.0 Update (2025.5.8)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 New Features</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎯 Algorithm Stability Improvement</strong>: Enhanced stability of priority-based roulette wheel recommendation algorithm</li>
<li><strong>💡 Enhanced Prompt Information</strong>: Added prompt information during probability calculation</li>
<li><strong>⚙️ Settings Page Optimization</strong>: Changed settings page access to right-click on top bar plugin icon</li>
<li><strong>📊 Default Value Settings</strong>: Set default value of 5 for all document metrics</li>
<li><strong>🔄 Batch Update</strong>: Added batch update action when modifying metric information</li>
<li><strong>🔧 Auto Correction</strong>: Auto-correct metrics with 0 or empty values to default value 5</li>
<li><strong>📋 History Records</strong>: Added roaming history viewing functionality</li>
</ul>
</li>
</ul>
<details style="margin-top: 1.5em;">
<summary style="color: #666; cursor: pointer; font-weight: 500;">📋 View Historical Updates</summary>
<div style="margin-top: 1em; padding-top: 1em; border-top: 1px solid #e0e7ff;">

<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.0.1 Update (2025.5.7)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #f59e0b;">✨ Feature Improvements</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎨 Prompt Information Beautification</strong>: Beautified prompt information with poetic expressions</li>
<li><strong>🔗 Document Link Optimization</strong>: Improved help document links pointing to GitHub repository Chinese documentation</li>
</ul>
</li>
</ul>
<hr style="margin: 1.5em 0; border: none; border-top: 1px solid #e0e7ff;">
<strong style="color: #6366f1; font-size: 1.1em;">📅 v1.0.0 Update (2025.5.6)</strong>
<ul style="margin: 0.5em 0; padding-left: 1.2em;">
<li style="margin: 0.3em 0;"><strong style="color: #10b981;">🆕 First Version</strong>
<ul style="margin: 0.2em 0; padding-left: 1em;">
<li><strong>🎯 Incremental Reading Core</strong>: First usable incremental reading version</li>
<li><strong>⚖️ Custom Metrics</strong>: Added user-customizable article parameters and weights</li>
<li><strong>📊 Priority Calculation</strong>: Priority calculation based on parameters</li>
<li><strong>🎲 Roulette Wheel Algorithm</strong>: Document recommendation based on roulette wheel algorithm</li>
<li><strong>📁 Filtering Function</strong>: Support notebook and root document filtering</li>
<li><strong>🎲 Random Mode</strong>: Support completely random "one-time" mode</li>
</ul>
</li>
</ul>

</div>
</details>
    </div>
</div>
