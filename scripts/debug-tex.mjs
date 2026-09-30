import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildArchiveFiles,
  createDefaultManifest,
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

async function main() {
  const dir = join(root, ".debug-tex");
  mkdirSync(dir, { recursive: true });
  const m = createDefaultManifest();
  m.build = { ...m.build, fontset: "fandol" };
  const contents: Record<string, string> = {
    "sections/00-intro.tex": "\\section{Introduction}\n\nPapex Writer smoke test.\n",
    "sections/01-method.tex": "\\section{Method}\n\nDual-mode editor.\n",
    "sections/02-experiments.tex": "\\section{Experiments}\n\nResults.\n",
    "sections/03-conclusion.tex": "\\section{Conclusion}\n\nDone.\n",
  };
  const templateTex = readFileSync(join(root, "resources/latex/papex-template.tex"), "utf-8");
  const cls = readFileSync(join(root, "resources/latex/papex.cls"), "utf-8");
  const archive = buildArchiveFiles(m, contents, { templateTex, cls });
  for (const f of archive) {
    const abs = join(dir, ...f.name.split("/"));
    mkdirSync(join(dir, ...f.name.split("/").slice(0, -1)), { recursive: true });
    writeFileSync(abs, f.content, "utf-8");
  }
  const mkrc = join(root, "resources/latex/latexmkrc");
  if (existsSync(mkrc)) copyFileSync(mkrc, join(dir, "latexmkrc"));
  console.log("files:", readdirSync(dir).join(", "));
  const r = await run(process.platform === "win32" ? "latexmk.exe" : "latexmk", ["-xelatex", "-interaction=nonstopmode", "papex-template.tex"], dir);
  console.log("code", r.code);
  console.log(r.out.slice(-5000));
  const log = join(dir, "papex-template.log");
  if (existsSync(log)) {
    const text = readFileSync(log, "utf-8");
    console.log("--- LOG TAIL ---");
    console.log(text.slice(-6000));
  }
  console.log("PDF", existsSync(join(dir, "papex-template.pdf")));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
