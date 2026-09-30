# Papex Writer

> Papex 论文创意与编辑软件 —— 本地优先的学术写作桌面工作台
>
> [![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
> [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
> [![Electron](https://img.shields.io/badge/Electron-33-47848f.svg)]()

[English](README.md) · [简体中文](README_zh.md)

**Papex Writer** 是 [Papex](https://github.com/Maicarons/papex) 学术平台的桌面创作端：灵感捕获、大纲编排、源码/所见即所得双模 LaTeX 编辑、Markdown 转写、AI 全流程辅助，并基于 [papex-latex](https://github.com/Maicarons/papex/tree/main/papex-latex) 导出平台兼容的 `submission.tar.gz`。

## 功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 项目管理 | ✅ | 新建 / 打开 / 最近项目；`papex.json` 契约 |
| 创意收件箱 | ✅ | 灵感入库、标签、升格为章节 |
| 章节大纲 | ✅ | 拖拽排序、增删、与 `sections[]` 同步 |
| 源码编辑 | ✅ | LaTeX 编辑、查找、快捷键 |
| Visual 所见即所得 | ✅ | 源码投影：标题/强调/列表/公式/表格芯片 |
| Markdown 转写 | ✅ | MD → 论文片段（规则引擎 + Diff 预览） |
| 元数据编辑 | ✅ | papex.json 全字段 + schema 校验 |
| 参考文献 | ✅ | BibTeX 条目、插入 `\cite{}` |
| 本地编译 | ✅ | latexmk/xelatex、错误面板、PDF 预览 |
| AI 辅助 | ✅ | 可插拔 Provider（Ollama/OpenAI/Anthropic）、润色/大纲/报错解释 |
| 导出投稿包 | ✅ | submission.tar.gz / papex-archive.json |
| VitePress 文档 | ✅ | 中英指南与参考 |

## 系统要求

- Windows 10 x64+ / macOS 11+ / 现代 Linux
- Node.js 20+（开发）
- TeX Live 或 MiKTeX（编译 PDF；无 TeX 仍可编辑与导出）

## 开发

```bash
npm install
npm run dev          # Electron + HMR
npm run test         # Vitest 单元测试
npm run typecheck
npm run build        # electron-vite 构建
npm run docs:dev     # 文档站
npm run sync:latex   # 同步 papex-latex 资源
npm run verify:example
```

## 架构

```text
packages/
  latex-core/    # papex-latex 语义：转义、_papex_*.tex、归档、schema
  md-to-latex/   # Markdown → LaTeX 规则引擎
  ai-core/       # AI Provider / 提示词 / 流式
  shared/        # 跨进程类型
src/
  main/          # Electron 主进程：项目 / 编译 / 导出 / IPC
  preload/       # contextBridge
  renderer/      # React UI：双模编辑、创意、元数据、文献、AI、导出
resources/latex/ # papex.cls / template / schema
docs/            # VitePress
```

设计与工程方案见 [PROJECT_PLAN.md](PROJECT_PLAN.md)。

## AI 配置

默认离线可用（规则引擎）。配置本地 Ollama：

```bash
ollama serve
ollama pull llama3
```

或在应用设置中指定 OpenAI 兼容 / Anthropic 端点。隐私说明见 [docs/reference/ai-privacy.md](docs/reference/ai-privacy.md)。

## License

[Apache-2.0](LICENSE) — Copyright 2026 The Papex Authors.
