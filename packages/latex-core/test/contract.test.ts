import { describe, expect, it } from "vitest";
import {
  buildArchiveFiles,
  createDefaultManifest,
  latexEscape,
  validateManifest,
} from "../src/index";

describe("latex-core contract", () => {
  it("escapes latex once", () => {
    expect(latexEscape("100% & $x$")).toBe("100\\% \\& \\$x\\$");
  });

  it("validates default manifest", () => {
    const m = createDefaultManifest();
    const r = validateManifest(m);
    expect(r.valid).toBe(true);
  });

  it("rejects missing abstract", () => {
    const m = createDefaultManifest();
    m.paper.abstract = "";
    const r = validateManifest(m);
    expect(r.valid).toBe(false);
  });

  it("builds archive files including generated fragments", () => {
    const m = createDefaultManifest();
    const contents: Record<string, string> = {};
    for (const s of m.sections) contents[s.file] = `\\section{${s.title}}\nHello`;
    const files = buildArchiveFiles(m, contents, {
      templateTex: "\\documentclass[11pt]{papex}\n",
      cls: "% papex.cls",
    });
    const names = files.map((f) => f.name);
    expect(names).toContain("papex.json");
    expect(names).toContain("_papex_meta.tex");
    expect(names).toContain("_papex_sections.tex");
    expect(names).toContain("papex.cls");
    expect(names.some((n) => n.startsWith("sections/"))).toBe(true);
  });

  it("applies template options", () => {
    const m = createDefaultManifest();
    m.build = { ...m.build, bibStyle: "authoryear", columns: 2 };
    const files = buildArchiveFiles(
      m,
      { "sections/00-intro.tex": "x" },
      { templateTex: "\\documentclass[11pt]{papex}\n", cls: "" },
    );
    const tpl = files.find((f) => f.name === "papex-template.tex");
    expect(tpl?.content).toContain("bibstyle=authoryear");
    expect(tpl?.content).toContain("twocolumn");
  });
});
