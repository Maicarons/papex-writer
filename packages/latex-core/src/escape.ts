/**
 * Single-pass LaTeX / BibTeX escaping (aligned with papex writespace latex-gen.ts).
 * Replacement text is never re-scanned.
 */

const LATEX_MAP: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

export function latexEscape(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  let out = "";
  for (const ch of s) out += LATEX_MAP[ch] ?? ch;
  return out;
}

export function bibtexEscape(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/[\\%&#{}]/g, (m) => {
    if (m === "{") return "\\{";
    if (m === "}") return "\\}";
    return "\\" + m;
  });
}
