# 项目方案

本页收录 Papex Writer 的完整产品与工程方案摘要。完整版见仓库根目录 [`PROJECT_PLAN.md`](https://github.com/Maicarons/papex-writer/blob/main/PROJECT_PLAN.md)（v1.1）。

## 定位

本地优先、AI 全程辅助的学术写作工作台：**灵感 → 大纲 → 双模编辑 → 可编译稿件 → Papex 投稿包**。

## 设计原则

| 原则 | 含义 |
|------|------|
| 契约一致 | 元数据以 `papex.json`（schema v1.0.0）为唯一真相源 |
| 本地优先 | 数据落在本地项目目录，不登录也能写作导出 |
| 界面同源 | 设计令牌与 papex 网页端同一视觉语言 |
| 单源编辑器 | 源码是唯一真相，所见即所得是投影 |
| AI 可插拔 | 全流程辅助，每步可关；本地模型优先 |
| 可离线编译 | 依赖本机 TeX 完成 PDF 构建 |
| Win10 基线 | Electron，Windows 10 起步 |

## Overleaf 借鉴

基于 `overleaf/overleaf` 开源仓库源码调研（不复制 AGPL 代码）：

- Visual 模式 = CodeMirror 装饰层投影（非第二套文档）
- ranges-tracker 思想 → 本地批注与修订
- LaTeX/Markdown 语言服务：补全、大纲、snippet
- 命令面板、PDF 日志人话化、版本快照、表格生成器

详见方案第 3 节。

## 全流程 AI

灵感提炼 → 大纲建议 → MD 转写增强 → 润色扩写 → 表/公式生成 → 错误解释 → 摘要生成 → 审阅预检。Provider 可插拔（Ollama / OpenAI 兼容 / Anthropic）。

## 双模编辑

源码（CodeMirror 6）与所见即所得共享文档；支持 Markdown 片段转论文片段（规则引擎 + AI 增强）。

## 里程碑

| 里程碑 | 出口标准 |
|--------|----------|
| M0 蓝图 | 方案与仓库骨架 |
| M1 壳与契约 | 建项目 + schema 校验 |
| M2 双模写作 | Visual + MD 转写 + 多章节草稿 |
| M3 编译与 AI P0 | 导出包可被 Papex 接受 |
| M4 发布 | Win10 安装包 + 文档 |
