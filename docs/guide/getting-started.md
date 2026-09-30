# 快速开始

Papex Writer 是 Papex 生态的桌面论文创作与编辑软件。本页带你从安装到导出第一份投稿包。

## 系统要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10 x64 及以上；macOS 11+；现代 Linux |
| 运行时 | 开发需 Node.js 20+ |
| TeX 发行版（可选） | TeX Live / MiKTeX，含 `xelatex`、`biber`、`latexmk` |

> 没有 TeX 也可以创建项目、编辑与导出 `submission.tar.gz`；只有本地 PDF 预览需要 TeX。

## 安装（开发模式）

```bash
git clone https://github.com/Maicarons/papex-writer.git
cd papex-writer
npm install
npm run dev
```

## 创建第一个项目

1. 启动后在欢迎页选择「从 papex 模板新建」
2. 选择本地目录作为项目根
3. 应用会生成：
   - `papex.json` —— 元数据清单（契约）
   - `sections/` —— 章节源文件
   - `resources/latex/papex.cls` 等模板资源

## 三分钟写作流程

1. **元数据**：填写标题、摘要、作者
2. **大纲**：添加「引言 / 方法 / 实验 / 结论」章节
3. **编辑**：在 CodeMirror 中撰写正文
4. **文献**：添加参考文献，用 `\cite{key}` 引用
5. **编译**：点击「编译」预览 PDF
6. **导出**：生成 `submission.tar.gz` 提交 Papex

## 下一步

- [创意工作流](./ideation)
- [章节与编辑](./editing)
- [导出投稿包](./export)
- [项目方案](./project-plan)
