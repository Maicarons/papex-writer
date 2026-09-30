# 项目方案

本页收录 Papex Writer 的完整产品与工程方案摘要。完整版见仓库根目录 [`PROJECT_PLAN.md`](https://github.com/Maicarons/papex-writer/blob/main/PROJECT_PLAN.md)。

## 定位

本地优先的学术写作工作台：**灵感 → 大纲 → 正文 → 可编译稿件 → Papex 投稿包**。

## 设计原则

| 原则 | 含义 |
|------|------|
| 契约一致 | 元数据以 `papex.json`（schema v1.0.0）为唯一真相源 |
| 本地优先 | 数据落在本地项目目录，不登录也能写作导出 |
| 界面同源 | 设计令牌与 papex 网页端同一视觉语言 |
| 可离线编译 | 依赖本机 TeX 完成 PDF 构建 |
| Win10 基线 | Electron，Windows 10 起步 |

## 功能范围（摘要）

- **P0**：项目管理、创意库、章节树、LaTeX 编辑器、元数据、文献库、本地编译预览、导出 tar.gz
- **P1**：snippet、DOI 导入、版本快照、写作统计、i18n
- **P2**：Papex 云对接、AI 辅助、全文检索

## 技术栈

Electron 33 · React 19 · TypeScript · Vite · Tailwind CSS 4 · shadcn/ui · CodeMirror 6 · pdf.js · Zustand · VitePress · Vitest · Playwright

## 界面设计

- 色彩令牌与 papex `globals.css` 1:1（靛蓝主色 `224 76% 40%`）
- 字体：Open Sans + Poppins；编辑器 JetBrains Mono
- 三栏工作台：导航 / 主工作区 / 检查器（大纲 · PDF · 引用）

## 里程碑

| 里程碑 | 出口标准 |
|--------|----------|
| M0 蓝图 | 方案与仓库骨架 |
| M1 壳与契约 | 建项目 + schema 校验 |
| M2 写作核心 | 多章节草稿闭环 |
| M3 编译闭环 | 导出包可被 Papex 接受 |
| M4 发布 | Win10 安装包 + 文档 |

## 验收标准

详见 `PROJECT_PLAN.md` [第 16 节](https://github.com/Maicarons/papex-writer/blob/main/PROJECT_PLAN.md#16-验收标准)。
