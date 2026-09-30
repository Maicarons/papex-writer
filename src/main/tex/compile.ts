import { spawn } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { CompileError, CompileResult, ProjectFileEntry } from "@shared/types";
import { buildArchiveFiles, validateManifest, type PapexManifest } from "@latex-core/index";
import { readResource } from "../project/project-service";

function parseErrors(log: string): CompileError[] {
  const errors: CompileError[] = [];
  const lines = log.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fileMatch = line.match(/^!\s*(.*)$/);
    if (fileMatch) {
      let file: string | undefined;
      let lineNo: number | undefined;
      for (let j = Math.max(0, i - 5); j < i; j++) {
        const m = lines[j].match(/^\(([^)]+\.tex)/);
        if (m) file = m[1];
      }
      const lm = line.match(/l\.(\d+)/);
      if (lm) lineNo = Number(lm[1]);
      const lm2 = lines.slice(i, i + 3).join(" ").match(/l\.(\d+)/);
      if (!lineNo && lm2) lineNo = Number(lm2[1]);
      errors.push({ file, line: lineNo, message: fileMatch[1], level: "error" });
    } else if (/^LaTeX Warning:/.test(line)) {
      errors.push({ message: line.replace(/^LaTeX Warning:\s*/, ""), level: "warning" });
    }
  }
  return errors.slice(0, 100);
}

async function run(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 120000,
): Promise<{ code: number | null; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, shell: false, windowsHide: true });
    let output = "";
    const timer = setTimeout(() => {
      child.kill();
      resolve({ code: -1, output: output + "\n[timeout]" });
    }, timeoutMs);
    child.stdout.on("data", (d) => (output += String(d)));
    child.stderr.on("data", (d) => (output += String(d)));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: -1, output: output + "\n" + e.message });
    });
  });
}

function writeLocal(p: string, content: string): void {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content, "utf-8");
}

function copyAssets(root: string, buildDir: string): void {
  const assets = join(root, "assets");
  if (!existsSync(assets)) return;
  const walk = (dir: string, base: string) => {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      const rel = base ? `${base}/${name}` : name;
      const dest = join(buildDir, "assets", ...rel.split("/"));
      if (statSync(abs).isDirectory()) {
        mkdirSync(dest, { recursive: true });
        walk(abs, rel);
      } else {
        copyFileSync(abs, dest);
      }
    }
  };
  walk(assets, "");
}

export function loadManifestAndContents(root: string): {
  manifest: PapexManifest;
  contents: Record<string, string>;
  files: ProjectFileEntry[];
} | null {
  const manifestPath = join(root, "papex.json");
  if (!existsSync(manifestPath)) return null;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as PapexManifest;
  const contents: Record<string, string> = {};
  const files: ProjectFileEntry[] = [];
  for (const s of manifest.sections ?? []) {
    const p = join(root, s.file);
    const content = existsSync(p) ? readFileSync(p, "utf-8") : "";
    contents[s.file] = content;
    files.push({ name: s.file, content });
  }
  for (const a of manifest.appendices ?? []) {
    const p = join(root, a.file);
    const content = existsSync(p) ? readFileSync(p, "utf-8") : "";
    contents[a.file] = content;
    files.push({ name: a.file, content });
  }
  return { manifest, contents, files };
}

export function writeBuildArtifacts(
  root: string,
  manifest: PapexManifest,
  contents: Record<string, string>,
): string {
  const templateTex = readResource("papex-template.tex") || "\\documentclass[11pt]{papex}\n";
  const cls = readResource("papex.cls") || "\\ProvidesClass{papex}";
  const archive = buildArchiveFiles(manifest, contents, { templateTex, cls });

  const buildDir = join(root, ".papex-writer", "build");
  mkdirSync(buildDir, { recursive: true });
  for (const f of archive) {
    writeLocal(join(buildDir, ...f.name.split("/")), f.content);
  }
  copyAssets(root, buildDir);
  return buildDir;
}

export async function compileProject(root: string): Promise<CompileResult> {
  const started = Date.now();
  const loaded = loadManifestAndContents(root);
  if (!loaded) {
    return {
      ok: false,
      log: "papex.json not found",
      errors: [{ message: "papex.json not found", level: "error" }],
      durationMs: 0,
    };
  }

  const validation = validateManifest(loaded.manifest);
  if (!validation.valid) {
    return {
      ok: false,
      log: "manifest invalid",
      errors: validation.issues.map((i) => ({
        message: `${i.path}: ${i.message}`,
        level: "error" as const,
      })),
      durationMs: Date.now() - started,
    };
  }

  const buildDir = writeBuildArtifacts(root, loaded.manifest, loaded.contents);
  const latexmk = process.platform === "win32" ? "latexmk.exe" : "latexmk";
  const result = await run(
    latexmk,
    ["-xelatex", "-interaction=nonstopmode", "papex-template.tex"],
    buildDir,
  );

  const logPath = join(buildDir, "papex-template.log");
  const log = existsSync(logPath) ? readFileSync(logPath, "utf-8") : result.output;
  const pdfPath = join(buildDir, "papex-template.pdf");
  const ok = existsSync(pdfPath);
  const errors = parseErrors(log);
  if (!ok && result.code === -1) {
    errors.unshift({
      message: "latexmk 调用失败，请确认已安装 TeX Live / MiKTeX 并加入 PATH",
      level: "error",
    });
  }

  return {
    ok,
    pdfPath: ok ? pdfPath : undefined,
    log: log.slice(-120000),
    errors: errors.slice(0, 100),
    durationMs: Date.now() - started,
  };
}
