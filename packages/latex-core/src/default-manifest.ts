import type { PapexManifest } from "./types";

export function createDefaultManifest(partial?: Partial<PapexManifest>): PapexManifest {
  const base: PapexManifest = {
    schemaVersion: "1.0.0",
    paper: {
      title: "未命名论文",
      abstract: "在此填写摘要。",
      keywords: [],
      primaryCategoryId: "cs.AI",
      secondaryCategoryIds: [],
      license: "CC-BY-4.0",
      language: "zh",
    },
    authors: [
      {
        name: "作者姓名",
        affiliation: "机构名称",
        order: 0,
        corresponding: true,
      },
    ],
    references: [],
    sections: [
      { id: "intro", title: "引言", file: "sections/00-intro.tex", level: "section" },
      { id: "method", title: "方法", file: "sections/01-method.tex", level: "section" },
      { id: "experiments", title: "实验", file: "sections/02-experiments.tex", level: "section" },
      { id: "conclusion", title: "结论", file: "sections/03-conclusion.tex", level: "section" },
    ],
    acknowledgments: "",
    funding: "",
    build: {
      documentclass: "papex",
      fontset: "windows",
      bibStyle: "numeric",
      columns: 1,
      hyperref: true,
    },
  };
  return {
    ...base,
    ...partial,
    paper: { ...base.paper, ...(partial?.paper ?? {}) },
    authors: partial?.authors ?? base.authors,
    sections: partial?.sections ?? base.sections,
  };
}

export const DEFAULT_SECTION_BODIES: Record<string, string> = {
  "sections/00-intro.tex":
    "\\section{引言}\n\n在此撰写引言。说明研究背景、问题与贡献。\n\n",
  "sections/01-method.tex":
    "\\section{方法}\n\n在此描述方法框架与关键技术。\n\n",
  "sections/02-experiments.tex":
    "\\section{实验}\n\n在此报告实验设置与结果。\n\n",
  "sections/03-conclusion.tex":
    "\\section{结论}\n\n总结全文并讨论未来工作。\n\n",
};
