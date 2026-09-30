# 架构说明

## 进程模型

- **Main**：项目文件系统、TeX 子进程、设置、系统对话框
- **Preload**：`contextBridge` 类型安全 IPC
- **Renderer**：React 19 UI、CodeMirror、pdf.js、Zustand

安全基线：`contextIsolation: true`、`nodeIntegration: false`、文件访问限制在项目根内。

## 模块

| 模块 | 职责 |
|------|------|
| `packages/latex-core` | 转义、片段生成、归档、schema 校验 |
| `src/main/tex` | 编译任务与日志解析 |
| `src/main/export` | tar.gz / PDF / zip |
| `src/renderer/features/*` | 创意、大纲、编辑、元数据、文献、编译、导出 |

更多见 [`PROJECT_PLAN.md`](https://github.com/Maicarons/papex-writer/blob/main/PROJECT_PLAN.md) 第 7 节。
