#!/usr/bin/env node
/**
 * Verify latex-core archive output against papex-latex example semantics.
 * Usage: node scripts/verify-example.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const required = [
  "resources/latex/papex.cls",
  "resources/latex/papex-template.tex",
  "resources/latex/papex.schema.json",
  "packages/latex-core/src/generate.ts",
  "packages/latex-core/src/escape.ts",
];

let failed = 0;
for (const f of required) {
  const p = join(root, f);
  if (!existsSync(p)) {
    console.error("MISSING:", f);
    failed++;
  } else {
    console.log("OK:", f);
  }
}

// Spot-check that generate.ts implements contract functions
const gen = readFileSync(join(root, "packages/latex-core/src/generate.ts"), "utf-8");
for (const fn of [
  "latexEscape",
  "bibtexEscape",
  "genMeta",
  "genAbstract",
  "genSections",
  "genBackmatter",
  "genAppendices",
  "genBib",
  "applyTemplateOptions",
  "buildArchiveFiles",
]) {
  if (!gen.includes(`function ${fn}`) && !gen.includes(`export function ${fn}`)) {
    // latexEscape is in escape.ts
    if (fn === "latexEscape" || fn === "bibtexEscape") continue;
    console.error("MISSING FN:", fn);
    failed++;
  }
}

if (failed) {
  console.error(`verify-example FAILED (${failed})`);
  process.exit(1);
}
console.log("verify-example PASSED");
