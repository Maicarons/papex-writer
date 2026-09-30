#!/usr/bin/env node
/**
 * Sync papex-latex resources from the upstream Papex repository.
 * Usage: node scripts/sync-latex.mjs [path-to-papex-repo]
 */
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const target = join(root, "resources", "latex");
const sourceArg = process.argv[2] ?? "G:\\GitHub\\papex\\papex-latex";

const files = [
  "papex.cls",
  "papex-template.tex",
  "papex.schema.json",
  "latexmkrc",
];

mkdirSync(target, { recursive: true });

let copied = 0;
for (const f of files) {
  const src = join(sourceArg, f);
  if (!existsSync(src)) {
    console.warn(`skip (missing): ${src}`);
    continue;
  }
  copyFileSync(src, join(target, f));
  copied += 1;
  console.log(`synced: ${f}`);
}

console.log(`Done. ${copied}/${files.length} files → resources/latex`);
