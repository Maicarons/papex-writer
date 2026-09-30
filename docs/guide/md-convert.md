# Markdown 转论文片段

> 状态：规划中（P0）

把 Markdown 素材（笔记、Obsidian、网页、AI 输出）快速变成 papex-latex 论文片段。

## 入口

1. **全局粘贴**：检测 Markdown 粘贴 →「转写为论文片段」
2. **导入 `.md`**：作为新章节或插入指定章节
3. **选区转写**：把已粘贴的 Markdown 转成 LaTeX
4. **创意库升格**：灵感卡片 → 章节草稿

## 规则映射（规则优先）

| Markdown | 论文 LaTeX |
|----------|-----------|
| `#` / `##` / `###` | `\section` / `\subsection` / `\subsubsection` |
| `**bold**` / `*em*` | `\textbf` / `\emph` |
| 列表 | `itemize` / `enumerate` |
| GFM 表格 | `booktabs` 三线表 |
| 行内代码 | `\texttt{}` |
| `$...$` / `$$...$$` | 行内 / 行间公式（保留） |
| `![alt](path)` | `figure` + `\includegraphics` |
| `[text](url)` | `\href` 或脚注 |
| 引用块 `>` | `quote` |

## AI 增强（可选）

- 语体升格（口语 → 学术书面语）
- 笔记结构重组为「问题-方法-结果-结论」
- 术语统一
- 过渡句建议（标注为 AI 建议，可丢弃）

## 安全

转写结果先显示 **Diff 预览**，确认后才写入章节。
