export type Lang = "zh" | "en";

const dict = {
  zh: {
    app: "Papex Writer",
    save: "保存",
    compile: "编译",
    export: "导出",
    source: "源码",
    visual: "Visual",
    editor: "编辑",
    ideation: "创意",
    meta: "元数据",
    refs: "文献",
    exportNav: "导出",
    ecosystem: "生态",
    outline: "大纲",
    pdf: "PDF",
    ai: "AI",
    welcome: "欢迎",
    newProject: "新建论文项目",
    openProject: "打开已有项目",
    statusReady: "就绪",
    wordCount: "词",
    theme: "主题",
    commandPalette: "命令面板",
  },
  en: {
    app: "Papex Writer",
    save: "Save",
    compile: "Compile",
    export: "Export",
    source: "Source",
    visual: "Visual",
    editor: "Editor",
    ideation: "Ideas",
    meta: "Metadata",
    refs: "Refs",
    exportNav: "Export",
    ecosystem: "Ecosystem",
    outline: "Outline",
    pdf: "PDF",
    ai: "AI",
    welcome: "Welcome",
    newProject: "New paper project",
    openProject: "Open project",
    statusReady: "Ready",
    wordCount: "words",
    theme: "Theme",
    commandPalette: "Command palette",
  },
} as const;

export type MessageKey = keyof (typeof dict)["zh"];

export function t(lang: Lang, key: MessageKey): string {
  return dict[lang][key] ?? dict.zh[key] ?? key;
}

export { dict };
