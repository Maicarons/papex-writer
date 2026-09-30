# Papex Writer

> Papex 论文创意与编辑软件 —— 本地优先的学术写作桌面工作台
>
> [![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
> [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
> [![Electron](https://img.shields.io/badge/Electron-33-47848f.svg)]()

[English](README.md) · [简体中文](README_zh.md)

**Papex Writer** 是 [Papex](https://github.com/Maicarons/papex) 学术平台的桌面创作端：灵感捕获、大纲编排、LaTeX 精编与实时 PDF 预览、文献管理，并基于 [papex-latex](https://github.com/Maicarons/papex/tree/main/papex-latex) 导出平台兼容的 `submission.tar.gz`。

## 功能（路线图）

- **创意收件箱** —— 灵感入库、打标签、一键升格为章节草稿
- **大纲与章节** —— 拖拽章节树，与 `papex.json` 双向同步
- **LaTeX 编辑器** —— CodeMirror 6、snippet、错误跳转、查找替换
- **元数据编辑** —— 覆盖 `papex.json` 全字段并实时校验
- **参考文献** —— BibTeX 库、cite key 补全、DOI/arXiv 导入
- **编译预览** —— 本机 `latexmk`/`xelatex` + pdf.js 并排预览
- **导出** —— Papex 兼容投稿包与 PDF

## 系统要求

- Windows 10 x64 及以上（macOS 11+ / 现代 Linux 同步支持）
- 开发：Node.js 20+
- 编译 PDF：TeX Live 或 MiKTeX（含 `xelatex`、`biber`、`latexmk`；无 TeX 也可编辑与导出）

## 开发

```bash
npm install
npm run dev          # Electron + Vite HMR
npm run test         # Vitest
npm run lint
npm run typecheck
npm run docs:dev     # VitePress 文档
```

## 文档

```bash
npm run docs:dev
```

完整产品与工程方案见 [PROJECT_PLAN.md](PROJECT_PLAN.md)。

## 相关项目

- [Papex](https://github.com/Maicarons/papex) —— 开源学术文献平台
- papex-latex —— XeLaTeX 模板与构建工具链（位于 Papex 仓库）
- [Papex Desktop](https://github.com/Maicarons/papex-desktop) —— 文献阅读桌面端（Tauri）

## License

[Apache-2.0](LICENSE) — Copyright 2026 The Papex Authors.
