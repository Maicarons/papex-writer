# Papex Writer

> Papex 论文创意与编辑软件 —— 本地优先的学术写作桌面工作台
>
> [![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
> [![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
> [![Electron](https://img.shields.io/badge/Electron-33-47848f.svg)]()

[English](README.md) · [简体中文](README_zh.md)

**Papex Writer** is the desktop companion of the [Papex](https://github.com/Maicarons/papex) academic platform: capture ideas, outline sections, edit LaTeX with live PDF preview, manage references, and export a platform-compatible `submission.tar.gz` built on the [papex-latex](https://github.com/Maicarons/papex/tree/main/papex-latex) toolchain.

## Features (roadmap)

- **Ideation inbox** — capture research sparks, tag them, promote them into sections
- **Outline & sections** — drag-and-drop chapter tree synced with `papex.json`
- **LaTeX editor** — CodeMirror 6, snippets, jump-to-error, find/replace
- **Metadata editor** — full `papex.json` schema coverage with live validation
- **References** — BibTeX library, cite-key completion, DOI/arXiv import
- **Compile & preview** — local `latexmk`/`xelatex` + pdf.js side-by-side preview
- **Export** — papex-compatible `submission.tar.gz` and PDF

## Requirements

- Windows 10 x64 or later (macOS 11+ / modern Linux also supported)
- Node.js 20+ (development)
- TeX Live or MiKTeX with `xelatex`, `biber`, `latexmk` (for PDF compile; export works without TeX)

## Development

```bash
npm install
npm run dev          # Electron + Vite HMR
npm run test         # Vitest
npm run lint
npm run typecheck
npm run docs:dev     # VitePress documentation
```

## Documentation

```bash
npm run docs:dev
```

See [`docs/`](docs/) and [PROJECT_PLAN.md](PROJECT_PLAN.md) for the full product & engineering plan.

## Related projects

- [Papex](https://github.com/Maicarons/papex) — open academic literature platform
- papex-latex — XeLaTeX template & build toolchain (inside the Papex repo)
- [Papex Desktop](https://github.com/Maicarons/papex-desktop) — literature reading workspace (Tauri)

## License

[Apache-2.0](LICENSE) — Copyright 2026 The Papex Authors.
