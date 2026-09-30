# 导出投稿包

> 状态：规划中（P0）

## submission.tar.gz 结构

```text
submission.tar.gz
├── papex.json
├── papex-template.tex
├── references.bib          # 可选
├── papex.cls
├── _papex_meta.tex         # 自动生成
├── _papex_abstract.tex
├── _papex_sections.tex
├── _papex_backmatter.tex
├── _papex_appendices.tex
└── sections/
    └── *.tex
```

该结构与 papex-latex 提交包一致，可直接上传 Papex 平台。

## 其他产物

- **PDF**：复制本地编译产物
- **源码 zip**：含项目文件，便于归档

## 校验

导出前运行 `papex.schema.json` 校验，并检查章节文件是否齐全。
