# 双模编辑（源码 / 所见即所得）

> 状态：规划中（P0 / P1）

Papex Writer 的源码编辑与所见即所得编辑**共享同一份文档**。所见即所得不是另一份真相，而是源码的视觉投影——该架构借鉴 Overleaf 开源版 Visual Editor（`source-editor/extensions/visual`）。

## 切换

- 工具栏「源码 / Visual」开关
- `Ctrl/Cmd + Shift + V`
- 命令面板「切换视觉模式」

切换**不改变**文档内容，只改变呈现与键位。

## Visual 模式支持

| 元素 | 表现 | 源码 |
|------|------|------|
| 标题 | 大号粗体 | `\section{}` 等 |
| 加粗 / 斜体 | 所见即所得 | `\textbf{}` / `\emph{}` |
| 列表 | 项目符号 / 编号 | `itemize` / `enumerate` |
| 表格 | 网格编辑 | `tabular` |
| 图 | 缩略图 | `\includegraphics` |
| 公式 | 即时预览 | `$...$` / `equation` |
| 引用 | 「作者 (年份)」徽标 | `\cite{key}` |
| 脚注 | 上标气泡 | `\footnote{}` |

复杂宏在 Visual 中显示为「源码芯片」，点击可展开源码编辑。

## 与源码模式的约定

1. 源码是唯一真相
2. Visual 内编辑即时写回源码文本
3. 无法安全投影的结构自动降级为源码芯片
