# 章节与编辑

> 状态：规划中（P0）

## 章节树

章节树与 `papex.json` 的 `sections[]` 双向同步：

- 新增/删除/重排章节会更新清单
- 每个章节对应 `sections/<file>.tex`
- 支持 `section` / `subsection` / `subsubsection` 层级

## 编辑器

基于 CodeMirror 6：

- LaTeX / 文本高亮
- 括号匹配与折叠
- 多光标、列选择
- 查找替换（`Ctrl/Cmd + F` / `H`）
- 从大纲或错误面板跳转

## 自动保存

输入停止 400ms 后写盘（与 Papex Writespace 同款防抖策略）；崩溃后可恢复未保存缓冲区。
