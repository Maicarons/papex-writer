import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ExportResult, ProjectFileEntry } from "@shared/types";
import {
  buildArchiveFiles,
  serializeArchive,
  validateManifest,
  type PapexManifest,
} from "@latex-core/index";
import { readResource } from "../project/project-service";
import { writeBuildArtifacts, loadManifestAndContents } from "../tex/compile";
import { spawn } from "node:child_process";

/**
 * Export submission package.
 * Primary format: directory + JSON archive describing files (papex-archive/v1).
 * Also writes a simple concatenation for tooling. tar.gz can be produced later
 * via system tar when available.
 */
export async function exportArchive(payload: {
  root: string;
  manifest: unknown;
  files: ProjectFileEntry[];
}): Promise<ExportResult> {
  const { root, manifest, files } = payload;
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    return {
      ok: false,
      error: validation.issues.map((i) => `${i.path}: ${i.message}`).join("; "),
      files: [],
    };
  }

  const contents: Record<string, string> = {};
  for (const f of files) contents[f.name] = f.content;

  const templateTex = readResource("papex-template.tex") || "\\documentclass[11pt]{papex}\n";
  const cls = readResource("papex.cls") || "\\ProvidesClass{papex}";
  const archive = buildArchiveFiles(manifest as PapexManifest, contents, { templateTex, cls });

  const outDir = join(root, "dist");
  mkdirSync(outDir, { recursive: true });

  // Write package directory
  const pkgDir = join(outDir, "submission");
  mkdirSync(pkgDir, { recursive: true });
  for (const f of archive) {
    const abs = join(pkgDir, ...f.name.split("/"));
    mkdirSync(join(pkgDir, ...f.name.split("/").slice(0, -1)), { recursive: true });
    writeFileSync(abs, f.content, "utf-8");
  }

  const jsonPath = join(outDir, "submission.papex-archive.json");
  writeFileSync(jsonPath, serializeArchive(archive), "utf-8");

  // Best-effort tar.gz via system tar
  const tarPath = join(outDir, "submission.tar.gz");
  const tarOk = await tryTar(pkgDir, tarPath);

  return {
    ok: true,
    path: tarOk ? tarPath : jsonPath,
    files: archive.map((f) => f.name),
  };
}

function tryTar(dir: string, out: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Pack submission entries at archive root (papex.json, sections/, …)
    // matching papex-latex submission.tar.gz layout (no leading ./).
    const entries = readdirSync(dir).filter((n) => n !== "submission.papex-archive.json");
    if (!entries.length) {
      resolve(false);
      return;
    }
    const args = ["-czf", out, "-C", dir, ...entries];
    const child = spawn(process.platform === "win32" ? "tar.exe" : "tar", args, {
      windowsHide: true,
    });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0 && existsSync(out)));
  });
}

export async function exportPdf(root: string): Promise<ExportResult> {
  const loaded = loadManifestAndContents(root);
  if (!loaded) return { ok: false, error: "project not found", files: [] };

  writeBuildArtifacts(root, loaded.manifest, loaded.contents);
  const pdf = join(root, ".papex-writer", "build", "papex-template.pdf");
  if (!existsSync(pdf)) {
    return { ok: false, error: "PDF not built yet — run compile first", files: [] };
  }
  const outDir = join(root, "dist");
  mkdirSync(outDir, { recursive: true });
  const dest = join(outDir, "paper.pdf");
  writeFileSync(dest, readFileSync(pdf));
  return { ok: true, path: dest, files: ["paper.pdf"] };
}
