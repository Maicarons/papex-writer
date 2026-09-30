# Papex Writer · 桌面 UI/UX 重设计（v2）

> 已实现：Activity Rail + 可折叠 Context Panel + 主舞台（编辑器/PDF/AI）+ 右侧 Dock + StatusBar。截图：`docs/public/ui-preview.png`

## 风格锚点

- **产品气质**：Overleaf IDE × VS Code Activity Bar × papex 品牌蓝
- **参考**：Overleaf `main-layout`（Toolbar + Rail + Editor|PDF 分栏）、Linear/Notion 信息密度
- **模式**：深色优先（默认 dark），浅色完整可用；对比度 ≥ 4.5:1

## 布局（桌面三栏 + 全局 Rail）

```text
┌────────────────────────────────────────────────────────────────┐
│ TitleBar · 项目名 · 保存态 · Source/Visual · 编译 · 导出 · AI · 主题 │
├──┬──────────────┬───────────────────────────────────────────────┤
│R │ Context      │  Main Stage                                   │
│A │ Panel        │  · 编辑器（CodeMirror / Visual）               │
│I │ 280–320px    │  · 可选 PDF 预览分栏（可折叠）                  │
│L │              │  · 或表单页（元数据 / 文献 / 生态 / 欢迎）      │
│56│ 文件/大纲    │                                               │
│px│ 创意/检索    │                                               │
│  │ Git/插件     │                                               │
├──┴──────────────┴───────────────────────────────────────────────┤
│ StatusBar · 字数 · 章节 · 编译状态 · Provider · 语言               │
└────────────────────────────────────────────────────────────────┘
```

| 区域 | 宽度 | 职责 |
|------|------|------|
| Activity Rail | 56px | 全局模块切换（图标 + tooltip，激活态左侧光条） |
| Context Panel | 280–320px 可折叠 | 与当前模块相关的列表/树/检索 |
| Main Stage | 自适应 | 编辑器 + PDF 或表单 |
| TitleBar | 48px | 项目上下文操作（全局，不随模块变） |
| StatusBar | 28px | 全局状态 |

## 交互

- Rail 图标 44×44 点击区（桌面可 36），`cursor-pointer`，200ms color 过渡
- 面板拖拽调宽（记住宽度）
- `Ctrl+Shift+P` 命令面板；`Ctrl+B` 编译；`Ctrl+Shift+V` 双模
- Focus ring：`ring-2 ring-primary/60`
- 禁止 hover scale 位移

## 设计令牌（papex 对齐，不破坏品牌）

- 主色 primary `hsl(224 76% 40%)` / dark `hsl(217 91% 65%)`
- 背景分层：app bg → panel `card` → elevated `popover`
- 圆角 6–10px；分割线 1px `border`
- 字体：Open Sans / Poppins；编辑器 JetBrains Mono

## 反模式（避免）

- 不用 emoji 当图标（统一 lucide）
- 不做拥挤的多按钮工具栏堆叠（主命令固定，次级进省略菜单）
- 浅色模式不用浅灰正文（用 muted-foreground ≥ #475569）
