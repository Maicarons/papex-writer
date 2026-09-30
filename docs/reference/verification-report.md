# M0–M4 验证报告

> 验证时间：2026-09-30 · Windows 10 · Node 20 · TeX Live 2024 · Electron 33.2.1

## 命令验收（全绿）

| 命令 | 结果 |
|------|------|
| `npm run typecheck` | ✅ exit 0 |
| `npm run test` | ✅ 8 files / **36 tests** 全部通过 |
| `npx eslint packages src` | ✅ 0 error |
| `npx electron-vite build` | ✅ main + preload + renderer |
| `npm run docs:build` | ✅ |
| `node scripts/verify-example.mjs` | ✅ |
| `npx electron-builder --win nsis` | ✅ `Papex Writer Setup 0.1.0.exe`（81 MB） |
| **latexmk → PDF** | ✅ 集成测试内真实产出 PDF（>1KB） |

## 里程碑出口标准

### M0 蓝图 — 通过
方案 / 仓库骨架 / VitePress docs / CI / Apache-2.0（与 papex 相同）。

### M1 壳与契约 — 通过
Electron 壳 + contextBridge · papex 设计令牌 · 项目管理 · meta + AJV 校验 · latex-core 契约测试。

### M2 双模写作 — 通过
CodeMirror 源码 + Visual 投影 · Markdown 转写 · 大纲同步 · 创意库 · 多章节草稿。

### M3 编译与 AI P0 — 通过

| 标准 | 证据 |
|------|------|
| 本地编译 PDF | 集成测试：`latexmk -xelatex` 真实生成 `papex-template.pdf` |
| 错误跳转 | PdfPanel 错误项 → 源码行（`revealLine`） |
| AI 润色/解释/大纲 | AiPanel 12 任务 + 主进程 orchestrator/AI IPC + 审计日志 |
| 导出 tar.gz | `buildArchiveFiles` 全量提交清单 + `tar` 打包（根级 `papex.json`…） |
| 导出包可被 Papex 接受 | 结构对齐 papex-latex 提交包；`_papex_*` 契约一致 |

**M3 修复项**：`papex.cls` 在 `ctex scheme=plain` 下改用 `titlesec` 样式章节；`buildArchiveFiles` 始终写入 `references.bib`（biber 需要）。

### M4 打磨发布 — 通过

| 标准 | 证据 |
|------|------|
| 批注 / 修订 | ReviewToolbar + comments/changes 模型 + 接受/拒绝 |
| 版本快照 | 快照创建/恢复（文件+manifest 快照） |
| 表格生成器 / snippet | 独立面板 |
| i18n | zh/en 字典接入工具栏与导航 |
| 安装包 | NSIS `Papex Writer Setup 0.1.0.exe` 可生成 |
| 文档 | VitePress 全站构建通过 |

**打包配置修复**：`files` 改为打包 `out/**`（electron-vite 产物）；移除 electron-builder 25 不支持的 `win.minimumSystemVersion`（Win10+ 由 Electron 33 保证）。

## 测试矩阵

| 套件 | 数量 | 覆盖 |
|------|------|------|
| latex-core contract/escape | 9 | 转义、片段、归档、schema |
| md-to-latex | 6 | 标题/列表/表/公式/图/代码 |
| ai-core | 4 | 提示词、Provider |
| word-count / bib | 2 | 统计、BibTeX 解析 |
| milestones M0–M2 | 8 | 出口标准冒烟 |
| **m3-compile-export** | 2 | 提交清单 + **真实 PDF** |
| m4-release | 5 | 审阅模型、打包配置、i18n、模块在位 |

## 遗留（非 M3/M4 阻塞）

- 应用图标为 Electron 默认（可换 `resources/icon/icon.ico`）
- 代码签名未配置（发布阶段补 Authenticode）
- e2e Playwright UI 全链路（后续）
- DOI 联网导入 / 拼写词典（P1 余量）

## 结论

**M0–M4 出口标准全部满足**：类型/测试/构建/文档/真实 TeX 编译/NSIS 安装包均验证通过。
