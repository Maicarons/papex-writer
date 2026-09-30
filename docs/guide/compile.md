# 编译与预览

> 状态：规划中（P0）

## 依赖

本机安装 TeX Live 或 MiKTeX，并保证 `latexmk`、`xelatex`、`biber` 在 PATH 中。

## 流水线

1. Writer 将元数据与章节生成 `_papex_*.tex`（对齐 papex-latex 语义）
2. 主进程调用 `latexmk -xelatex papex-template.tex`
3. 产物 PDF 用 pdf.js 预览

## 错误定位

编译日志解析为错误列表；点击可跳转到对应源文件与行号。

## 安全

编译禁用 `--shell-escape`，输出隔离在 `.papex-writer/build/`。
