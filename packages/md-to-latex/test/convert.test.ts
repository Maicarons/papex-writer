import { describe, expect, it } from "vitest";
import { markdownToLatex } from "../src/index";

describe("markdownToLatex", () => {
  it("converts headings", () => {
    const r = markdownToLatex("# 引言\n\n正文");
    expect(r.latex).toContain("\\section{引言}");
  });

  it("converts emphasis and lists", () => {
    const r = markdownToLatex("**加粗** 与 *强调*\n\n- 项目一\n- 项目二");
    expect(r.latex).toContain("\\textbf{加粗}");
    expect(r.latex).toContain("\\emph{强调}");
    expect(r.latex).toContain("\\begin{itemize}");
    expect(r.latex).toContain("\\item 项目一");
  });

  it("converts tables to booktabs", () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const r = markdownToLatex(md);
    expect(r.latex).toContain("\\begin{table}");
    expect(r.latex).toContain("\\toprule");
    expect(r.latex).toContain("1 & 2");
  });

  it("keeps math blocks", () => {
    const r = markdownToLatex("$$E=mc^2$$");
    expect(r.latex).toContain("\\[");
    expect(r.latex).toContain("E=mc^2");
  });

  it("converts images to figures", () => {
    const r = markdownToLatex("![架构图](assets/arch.png)");
    expect(r.latex).toContain("\\includegraphics");
    expect(r.latex).toContain("assets/arch.png");
  });

  it("converts code fences to verbatim", () => {
    const r = markdownToLatex("```tex\n\\section{x}\n```");
    expect(r.latex).toContain("\\begin{verbatim}");
    expect(r.latex).toContain("\\section{x}");
  });
});
