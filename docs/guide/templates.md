# 模板与 papex-latex

Papex Writer 内置 papex-latex 工具链资源，并保持契约对齐。

## 内置资源

| 文件 | 用途 |
|------|------|
| `papex.cls` | 文档类（标题块 / 作者 / 页眉页脚 / biblatex） |
| `papex-template.tex` | 主文档 |
| `papex.schema.json` | `papex.json` 校验 Schema |
| `latexmkrc` | latexmk 配置 |
| `example/` | 完整示例（「从示例新建」） |

## 构建语义

`packages/latex-core` 与 papex 网页 Writespace 的 `latex-gen.ts` 同构：

- 单遍 LaTeX/BibTeX 转义
- 生成 `_papex_*.tex` 与 `references.bib`
- `build.fontset` / `bibStyle` / `columns` 注入 documentclass

## 同步上游

```bash
npm run sync:latex      # 从 papex 仓库同步资源
npm run verify:example  # 与上游 example 比对
```
