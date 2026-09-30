import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Papex Writer",
  description: "Papex 论文创意与编辑软件 — 本地优先的学术写作桌面工作台",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "Papex Writer",
    nav: [
      { text: "指南", link: "/guide/getting-started" },
      { text: "参考", link: "/reference/papex-json" },
      { text: "方案", link: "/guide/project-plan" },
      {
        text: "Papex",
        items: [
          { text: "Papex 平台", link: "https://github.com/Maicarons/papex" },
          { text: "papex-latex", link: "https://github.com/Maicarons/papex/tree/main/papex-latex" },
        ],
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "创意工作流", link: "/guide/ideation" },
            { text: "双模编辑（源码 / 所见即所得）", link: "/guide/dual-edit" },
            { text: "Markdown 转论文片段", link: "/guide/md-convert" },
            { text: "AI 辅助写作", link: "/guide/ai" },
            { text: "章节与编辑", link: "/guide/editing" },
            { text: "参考文献", link: "/guide/references" },
            { text: "编译与预览", link: "/guide/compile" },
            { text: "导出投稿包", link: "/guide/export" },
            { text: "模板与 papex-latex", link: "/guide/templates" },
            { text: "项目方案", link: "/guide/project-plan" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "参考",
          items: [
            { text: "papex.json 字段", link: "/reference/papex-json" },
            { text: "快捷键", link: "/reference/keyboard" },
            { text: "架构说明", link: "/reference/architecture" },
            { text: "命令行", link: "/reference/cli" },
            { text: "AI 端点与隐私", link: "/reference/ai-privacy" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/Maicarons/papex-writer" },
    ],
    footer: {
      message: "Apache-2.0 Licensed · Papex 生态项目",
      copyright: "Copyright 2026 The Papex Authors",
    },
    search: {
      provider: "local",
    },
    outline: { label: "本页目录", level: [2, 3] },
    docFooter: { prev: "上一篇", next: "下一篇" },
  },
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      title: "Papex Writer",
      description: "Papex 论文创意与编辑软件",
    },
  },
});
