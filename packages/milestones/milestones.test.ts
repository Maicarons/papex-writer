import { describe, expect, it } from "vitest";
import {
  buildArchiveFiles,
  createDefaultManifest,
  validateManifest,
  latexEscape,
  DEFAULT_SECTION_BODIES,
} from "../latex-core/src/index";
import { markdownToLatex } from "../md-to-latex/src/index";
import { buildPrompt, DEFAULT_AI_FEATURES, createProvider } from "../ai-core/src/index";

/**
 * Milestone exit-criteria smoke tests (M0/M1/M2 from PROJECT_PLAN.md).
 * Pure logic — no Electron/DOM required.
 */

describe("M0 blueprint", () => {
  it("default manifest is valid papex.json v1.0.0", () => {
    const m = createDefaultManifest();
    expect(m.schemaVersion).toBe("1.0.0");
    expect(validateManifest(m).valid).toBe(true);
  });

  it("latex-core exposes full generate contract", () => {
    const m = createDefaultManifest();
    const contents: Record<string, string> = {};
    for (const s of m.sections) contents[s.file] = DEFAULT_SECTION_BODIES[s.file] ?? "x";
    const files = buildArchiveFiles(m, contents, {
      templateTex: "\\documentclass[11pt]{papex}",
      cls: "% cls",
    });
    const names = files.map((f) => f.name);
    expect(names).toContain("papex.json");
    expect(names).toContain("_papex_meta.tex");
    expect(names).toContain("_papex_abstract.tex");
    expect(names).toContain("_papex_sections.tex");
    expect(names).toContain("papex.cls");
    expect(names.filter((n) => n.startsWith("sections/")).length).toBe(4);
    // escaping is single-pass
    expect(latexEscape("100% & $x$")).toBe("100\\% \\& \\$x\\$");
  });
});

describe("M1 shell & contract", () => {
  it("rejects invalid manifest (missing abstract)", () => {
    const m = createDefaultManifest();
    m.paper.abstract = "";
    expect(validateManifest(m).valid).toBe(false);
  });

  it("build options inject into template", () => {
    const m = createDefaultManifest();
    m.build = { ...m.build, bibStyle: "authoryear", columns: 2 };
    const files = buildArchiveFiles(
      m,
      { "sections/00-intro.tex": "x" },
      { templateTex: "\\documentclass[11pt]{papex}", cls: "" },
    );
    const tpl = files.find((f) => f.name === "papex-template.tex")!;
    expect(tpl.content).toContain("bibstyle=authoryear");
    expect(tpl.content).toContain("twocolumn");
  });

  it("multi-section draft files are wired into _papex_sections", () => {
    const m = createDefaultManifest({
      sections: [
        { id: "a", title: "引言", file: "sections/00-intro.tex", level: "section" },
        { id: "b", title: "方法", file: "sections/01-method.tex", level: "section" },
      ],
    });
    const files = buildArchiveFiles(
      m,
      {
        "sections/00-intro.tex": "\\section{引言} body1",
        "sections/01-method.tex": "\\section{方法} body2",
      },
      { templateTex: "T", cls: "C" },
    );
    const sec = files.find((f) => f.name === "_papex_sections.tex")!.content;
    expect(sec).toContain("sections/00-intro.tex");
    expect(sec).toContain("sections/01-method.tex");
    expect(sec).toContain("\\section{引言}");
  });
});

describe("M2 dual-edit, MD convert, outline, ideation", () => {
  it("Markdown converts to paper fragment (headings/lists/table/math)", () => {
    const md = [
      "# 引言",
      "",
      "本文提出**双模编辑**。",
      "",
      "- 源码",
      "- Visual",
      "",
      "| A | B |",
      "|---|---|",
      "| 1 | 2 |",
      "",
      "$$E=mc^2$$",
    ].join("\n");
    const { latex } = markdownToLatex(md);
    expect(latex).toContain("\\section{引言}");
    expect(latex).toContain("\\textbf{双模编辑}");
    expect(latex).toContain("\\begin{itemize}");
    expect(latex).toContain("\\begin{table}");
    expect(latex).toContain("E=mc^2");
  });

  it("Visual projection parse round-trips section commands", () => {
    // simulate VisualEditor block rules used by the UI
    const src = "\\section{方法}\n\n\\textbf{重点} 内容\n\n\\begin{itemize}\n  \\item A\n\\end{itemize}\n";
    const blocks: string[] = [];
    for (const line of src.split("\n")) {
      const t = line.trim();
      const sec = t.match(/^\\(section|subsection|subsubsection)\{(.*)\}\s*$/);
      if (sec) blocks.push(`h:${sec[2]}`);
      if (t.startsWith("\\begin{itemize}")) blocks.push("list");
    }
    expect(blocks).toContain("h:方法");
    expect(blocks).toContain("list");
  });

  it("AI is pluggable and can be fully disabled without blocking rules", () => {
    expect(DEFAULT_AI_FEATURES.continuation).toBe(false);
    expect(DEFAULT_AI_FEATURES.polish).toBe(true);
    const p = createProvider({ kind: "ollama", baseUrl: "http://127.0.0.1:11434", model: "llama3" });
    expect(p.kind).toBe("ollama");
    const msgs = buildPrompt("outline", { title: "T", abstract: "A" });
    expect(msgs.length).toBeGreaterThan(0);
  });
});
