/**
 * M3 integration: generate papex artifacts and compile with local latexmk.
 * Runs only when TeX is on PATH; otherwise skips with a clear message.
 */
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildArchiveFiles,
  createDefaultManifest,
  serializeArchive,
  validateManifest,
} from "../latex-core/src/index";

const root = join(__dirname, "..", "..");

function run(cmd: string, args: string[], cwd: string): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, windowsHide: true, shell: false });
    let out = "";
    child.stdout.on("data", (d) => (out += String(d)));
    child.stderr.on("data", (d) => (out += String(d)));
    child.on("error", (e) => resolve({ code: -1, out: e.message }));
    child.on("close", (code) => resolve({ code, out }));
  });
}

async function detectTex(): Promise<boolean> {
  const r = await run(process.platform === "win32" ? "latexmk.exe" : "latexmk", ["--version"], process.cwd());
  return r.code === 0;
}

describe("M3 compile & export contract", () => {
  it("archive contains every papex submission entry", () => {
    const m = createDefaultManifest();
    const contents: Record<string, string> = {};
    for (const s of m.sections) contents[s.file] = `\\section{${s.title}}\n\nHello.\n`;
    contents["references.bib"] = "";
    const files = buildArchiveFiles(m, contents, {
      templateTex: readFileSync(join(root, "resources/latex/papex-template.tex"), "utf-8"),
      cls: readFileSync(join(root, "resources/latex/papex.cls"), "utf-8"),
    });
    const names = new Set(files.map((f) => f.name));
    for (const required of [
      "papex.json",
      "papex-template.tex",
      "papex.cls",
      "_papex_meta.tex",
      "_papex_abstract.tex",
      "_papex_sections.tex",
      "_papex_backmatter.tex",
      "_papex_appendices.tex",
    ]) {
      expect(names.has(required)).toBe(true);
    }
    expect([...names].filter((n) => n.startsWith("sections/")).length).toBeGreaterThan(0);
    // serialization round-trip
    const raw = serializeArchive(files);
    expect(raw).toContain("papex-archive/v1");
  });

  it("produces a real PDF via latexmk when TeX is available", async () => {
    const texOk = await detectTex();
    if (!texOk) {
      console.warn("SKIP: latexmk not available");
      return;
    }

    const dir = mkdtempSync(join(tmpdir(), "papex-writer-"));
    try {
      const m = createDefaultManifest();
      expect(validateManifest(m).valid).toBe(true);
      const contents: Record<string, string> = {
        "sections/00-intro.tex": "\\section{Introduction}\n\nPapex Writer smoke test paragraph.\n",
        "sections/01-method.tex": "\\section{Method}\n\nWe use a dual-mode editor.\n",
        "sections/02-experiments.tex": "\\section{Experiments}\n\nSee table below.\n",
        "sections/03-conclusion.tex": "\\section{Conclusion}\n\nAll good.\n",
      };
      // use fandol for portable TeX Live on Windows too
      m.build = { ...m.build, fontset: "fandol" };

      const templateTex = readFileSync(join(root, "resources/latex/papex-template.tex"), "utf-8");
      const cls = readFileSync(join(root, "resources/latex/papex.cls"), "utf-8");
      const archive = buildArchiveFiles(m, contents, { templateTex, cls });
      for (const f of archive) {
        const abs = join(dir, ...f.name.split("/"));
        mkdirSync(join(dir, ...f.name.split("/").slice(0, -1)), { recursive: true });
        writeFileSync(abs, f.content, "utf-8");
      }
      // latexmkrc optional
      const mkrc = join(root, "resources/latex/latexmkrc");
      if (existsSync(mkrc)) {
        writeFileSync(join(dir, "latexmkrc"), readFileSync(mkrc, "utf-8"));
      }

      const result = await run(
        process.platform === "win32" ? "latexmk.exe" : "latexmk",
        ["-xelatex", "-interaction=nonstopmode", "papex-template.tex"],
        dir,
      );
      const pdf = join(dir, "papex-template.pdf");
      const log = existsSync(join(dir, "papex-template.log"))
        ? readFileSync(join(dir, "papex-template.log"), "utf-8")
        : result.out;
      if (!existsSync(pdf)) {
        const debugDir = join(root, ".debug-tex");
        mkdirSync(debugDir, { recursive: true });
        writeFileSync(join(debugDir, "latexmk.out.txt"), result.out + "\n\n---LOG---\n" + log, "utf-8");
        console.error("latexmk failed\n", log.slice(-4000), "\nspawn:", result.out.slice(-2000));
      }
      expect(existsSync(pdf)).toBe(true);
      const size = statSync(pdf).size;
      expect(size).toBeGreaterThan(1000);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 180_000);
});
