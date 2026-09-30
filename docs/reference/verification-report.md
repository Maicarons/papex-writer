# M0 / M1 / M2 验证报告

> 验证时间：2026-09-30 · 环境：Windows · Node 20 · Electron 33.2.1

## 命令验收

| 命令 | 结果 |
|------|------|
| `npm run typecheck` | ✅ exit 0 |
| `npm run test` | ✅ 6 files / **29 tests** 全部通过 |
| `npx eslint packages src` | ✅ exit 0 |
| `npx electron-vite build` | ✅ main 37.6kB + preload 0.8kB + renderer 1.9MB |
| `npm run docs:build` | ✅ VitePress 3.0s |
| `node scripts/verify-example.mjs` | ✅ PASSED |
| Electron 启动 | ✅ 进程存活（electron 33.2.1，4 进程） |

## 里程碑出口标准

### M0 蓝图（0.0.x）— 通过

| 标准 | 证据 |
|------|------|
| 项目方案 | `PROJECT_PLAN.md` v1.1 |
| 仓库骨架 | GitHub 结构 + `.github/` workflows |
| docs | VitePress 站可构建 |
| CI | `ci.yml` / `docs.yml` / `release.yml` |
| Apache-2.0 | 与 papex 同 LICENSE |

### M1 壳与契约（0.1.x）— 通过

| 标准 | 证据 |
|------|------|
| Electron 壳 | `src/main` + preload contextBridge + 窗口/菜单 |
| papex UI 设计令牌 | `globals.css` 与 papex 1:1（主色/圆角/深浅色） |
| 项目管理 | 新建/打开/最近项目 IPC |
| meta + schema | MetaPanel + AJV `validateManifest` |
| latex-core | 转义/片段/归档/校验，契约测试 5 项 |

**出口「建项目 + schema 校验」**：`createDefaultManifest()` → `validateManifest` 通过；非法 abstract 被拒绝（milestones 测试）。

### M2 双模写作（0.2.x）— 通过

| 标准 | 证据 |
|------|------|
| 源码编辑 | CodeMirror 6（高亮/搜索/补全/snippet） |
| Visual 装饰层 P0 | `VisualEditor` 投影标题/列表/公式/芯片 |
| MD 转写 | `markdownToLatex` 标题/列表/表/公式/图（测试覆盖） |
| 大纲 | OutlineList 与 `papex.json.sections` 同步 |
| 创意库 | IdeationPanel 收件箱/标签/升格 |

**出口「多章节草稿；MD 可转章节」**：4 章节默认项目 + `_papex_sections` 含全部章节；MD 转写测试断言 `\section` / `itemize` / `table` / 公式。

## 附带能力（超出 M2，已实现）

补全 cite/ref/env · 自动保存 · 批注/快照 · BibTeX 导入导出 · 表格生成器 · 字数统计 · 错误跳转 · AI 可插拔面板 · 导出 tar.gz

## 遗留 / 后续（M3/M4）

- TeX 本机编译 PDF 需安装 TeX Live/MiKTeX 后人工冒烟
- 批注选区锚点为简化版（整段），完整 range 漂移在 P1 完善
- DOI 联网导入、拼写词典、e2e Playwright 全链路在 M3/M4
- Win10 NSIS 安装包需在目标机器执行 `npm run dist`（electron-builder）

## 结论

**M0、M1、M2 出口标准全部满足**；类型检查、29 项单元测试、生产构建、文档构建、Electron 运行均通过。
