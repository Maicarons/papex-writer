# 参考文献

> 状态：规划中（P0 / P1）

## 文献库

- 本地 BibTeX 条目管理
- cite key 自动建议
- 从 DOI / arXiv ID 导入元数据（P1，可选联网）

## 引用

在正文中使用 `\cite{key}`；编辑器提供 key 补全。

## 与 papex.json 的关系

`references[]` 数组会导出到清单，并由 `latex-core` 生成 `references.bib`；也支持直接使用项目内 `references.bib`。
