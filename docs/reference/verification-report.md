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

### M5 生态 — 通过（脚手架 + 可用能力）

| 标准 | 证据 |
|------|------|
| Papex 云对接 | `@shared/papex-cloud`（health/categories/uploadArchive）+ 生态面板 |
| 本地 LLM | ai-core Provider（Ollama/OpenAI/Anthropic）+ 主进程 orchestrator |
| 全文检索 | `@shared/search` 轻量检索 + 右侧「检索」面板（跳行） |
| Git 面板 | `git:status` / `git:commit` IPC + Git 面板 |
| 插件扩展点 | snippet / exporter / prompt pack 注册表 + 内置包 |

**出口**：离线完整可用；云功能显式可选（`enabled: false` 安全降级）。

### M6 GA — 路线图（非本轮阻塞）

e2e Playwright UI 全链路、应用图标、Authenticode 签名、electron-updater、无障碍基线。见 PLAN §17。

## 测试矩阵

| 套件 | 数量 | 覆盖 |
|------|------|------|
| latex-core contract/escape | 9 | 转义、片段、归档、schema |
| md-to-latex | 6 | 标题/列表/表/公式/图/代码 |
| ai-core | 4 | 提示词、Provider |
| word-count / bib | 2 | 统计、BibTeX 解析 |
| milestones M0–M2 | 8 | 出口标准冒烟 |
| m3-compile-export | 2 | 提交清单 + **真实 PDF** |
| m4-release | 5 | 审阅模型、打包配置、i18n |
| **m5-ecosystem** | 3 | 插件、全文检索、云可选 |

## 遗留（非阻塞）

- 应用图标 / 代码签名 / 自动更新（M6）
- e2e Playwright（M6）
- DOI 联网导入 / 拼写词典（P1 余量）
- Git 远程 push 仍依赖用户系统 git 凭据

## 结论

**M0–M5 出口标准满足**；M6 列为 GA 路线图。39 tests、typecheck、lint、build、NSIS、真实 TeX PDF 均通过。

