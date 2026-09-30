import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import type { OpenProjectResult, ProjectFileEntry, WriterProjectState } from "@shared/types";
import { createDefaultWriterState } from "@shared/types";
import { createDefaultManifest, DEFAULT_SECTION_BODIES } from "@latex-core/default-manifest";

const SKIP = new Set(["node_modules", ".git", "out", "dist", ".papex-writer/build", ".papex-writer/snapshots"]);

function walkFiles(root: string, base = ""): ProjectFileEntry[] {
  const out: ProjectFileEntry[] = [];
  const dir = base ? join(root, base) : root;
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const rel = base ? `${base}/${name}` : name;
    const abs = join(root, rel);
    if (SKIP.has(name) || SKIP.has(rel.replace(/\\/g, "/"))) continue;
    const st = statSync(abs);
    if (st.isDirectory()) {
      out.push(...walkFiles(root, rel));
    } else if (st.isFile()) {
      const norm = rel.split(sep).join("/");
      if (
        norm.endsWith(".tex") ||
        norm.endsWith(".json") ||
        norm.endsWith(".bib") ||
        norm.endsWith(".md") ||
        norm === "latexmkrc"
      ) {
        try {
          out.push({ name: norm, content: readFileSync(abs, "utf-8") });
        } catch {
          /* binary or unreadable */
        }
      }
    }
  }
  return out;
}

export function openProject(root: string): OpenProjectResult | null {
  const manifestPath = join(root, "papex.json");
  if (!existsSync(manifestPath)) return null;

  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  } catch {
    return null;
  }

  let writerState: WriterProjectState | null = null;
  const statePath = join(root, ".papex-writer", "project.json");
  if (existsSync(statePath)) {
    try {
      writerState = JSON.parse(readFileSync(statePath, "utf-8")) as WriterProjectState;
    } catch {
      writerState = null;
    }
  }

  return {
    root,
    manifest,
    files: walkFiles(root),
    writerState: writerState ?? createDefaultWriterState(),
  };
}

export function createProject(root: string): OpenProjectResult | null {
  mkdirSync(root, { recursive: true });
  const manifest = createDefaultManifest();
  mkdirSync(join(root, "sections"), { recursive: true });
  mkdirSync(join(root, "assets"), { recursive: true });
  mkdirSync(join(root, ".papex-writer"), { recursive: true });

  writeFileSync(join(root, "papex.json"), JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  for (const s of manifest.sections) {
    const body = DEFAULT_SECTION_BODIES[s.file] ?? `\\section{${s.title ?? "章节"}}\n\n`;
    writeFileSync(join(root, s.file), body, "utf-8");
  }
  writeFileSync(
    join(root, ".papex-writer", "project.json"),
    JSON.stringify(createDefaultWriterState(), null, 2) + "\n",
    "utf-8",
  );
  // Also write template placeholder names for export tooling
  writeFileSync(join(root, "references.bib"), "% references\n", "utf-8");

  return openProject(root);
}

export function saveProject(payload: {
  root: string;
  manifest: unknown;
  files: ProjectFileEntry[];
  writerState?: WriterProjectState;
}): boolean {
  const { root, manifest, files, writerState } = payload;
  if (!existsSync(root)) mkdirSync(root, { recursive: true });

  writeFileSync(join(root, "papex.json"), JSON.stringify(manifest, null, 2) + "\n", "utf-8");

  for (const f of files) {
    if (f.name === "papex.json") continue;
    const abs = join(root, ...f.name.split("/"));
    mkdirSync(join(root, ...f.name.split("/").slice(0, -1)), { recursive: true });
    writeFileSync(abs, f.content, "utf-8");
  }

  if (writerState) {
    const dir = join(root, ".papex-writer");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "project.json"), JSON.stringify(writerState, null, 2) + "\n", "utf-8");
  }
  return true;
}

export function readResource(name: string): string {
  // resources/latex/* are packaged beside app; resolve from project root fallback
  const candidates = [
    join(__dirname, "../../resources/latex", name),
    join(process.cwd(), "resources/latex", name),
    join(__dirname, "../../../resources/latex", name),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, "utf-8");
  }
  return "";
}

export function toPosix(p: string): string {
  return relative(process.cwd(), p).split(sep).join("/");
}
