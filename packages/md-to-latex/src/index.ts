/**
 * Markdown → academic LaTeX fragment converter (rule-first).
 * AI enhancement is optional and applied outside this pure engine.
 */

export interface MdConvertOptions {
  /** Heading level offset so `#` becomes \section (offset 0) or \subsection (offset 1). */
  headingOffset?: number;
  /** Use booktabs for tables. */
  booktabs?: boolean;
  /** Emit figure environments for images. */
  figures?: boolean;
  /** Language hint for comments. */
  lang?: "zh" | "en";
}

export interface MdConvertResult {
  latex: string;
  warnings: string[];
}

const INLINE_CODE = /`([^`]+)`/g;
const BOLD = /\*\*([^*]+)\*\*/g;
const ITALIC = /(?<!\*)\*([^*]+)\*(?!\*)/g;
const STRIKE = /~~([^~]+)~~/g;
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
const IMAGE = /!\[([^\]]*)\]\(([^)]+)\)/g;

function escapePlain(text: string): string {
  // Don't escape already-handled markdown payloads; only bare specials outside code.
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function convertInline(src: string): string {
  let out = src;

  out = out.replace(IMAGE, (_m, alt, src2) => {
    const caption = alt ? `\\caption{${escapePlain(alt)}}\n` : "";
    return `\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\linewidth]{${src2}}\n${caption}\\end{figure}`;
  });

  out = out.replace(LINK, (_m, text, url) => `\\href{${url}}{${text}}`);
  out = out.replace(INLINE_CODE, (_m, code) => `\\texttt{${escapePlain(code)}}`);
  out = out.replace(BOLD, (_m, t) => `\\textbf{${t}}`);
  out = out.replace(ITALIC, (_m, t) => `\\emph{${t}}`);
  out = out.replace(STRIKE, (_m, t) => `\\sout{${t}}`);

  // Escape remaining specials but leave LaTeX commands we just inserted.
  // Split on backslash-commands to avoid double-escaping.
  const parts = out.split(/(\\[a-zA-Z]+\{[^{}]*\}|\\begin\{[^}]+\}|\\end\{[^}]+\}|\\href\{[^}]*\}\{[^}]*\}|\\includegraphics\[[^\]]*\]\{[^}]*\})/g);
  return parts
    .map((p) => {
      if (p.startsWith("\\")) return p;
      return p.replace(/([&%$#_])/g, "\\$1").replace(/~/g, "\\textasciitilde{}");
    })
    .join("");
}

function headingCommand(level: number, offset: number): string {
  const map = ["section", "subsection", "subsubsection", "paragraph", "subparagraph"];
  const idx = Math.min(Math.max(level - 1 + offset, 0), map.length - 1);
  return `\\${map[idx]}`;
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

function convertTable(lines: string[], start: number, options: MdConvertOptions): { latex: string; next: number } {
  const rows: string[][] = [];
  let i = start;
  while (i < lines.length && isTableRow(lines[i])) {
    const cells = parseTableRow(lines[i]);
    // skip separator row like |---|---|
    if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) {
      rows.push(cells);
    }
    i += 1;
  }

  const cols = rows[0]?.length ?? 1;
  const spec = "l".repeat(cols);
  const out: string[] = [];
  out.push("\\begin{table}[htbp]");
  out.push("\\centering");
  if (options.booktabs !== false) {
    out.push(`\\begin{tabular}{${spec}}`);
    out.push("\\toprule");
    if (rows.length) {
      out.push(rows[0].map(convertInline).join(" & ") + " \\\\");
      out.push("\\midrule");
      for (const r of rows.slice(1)) {
        out.push(r.map(convertInline).join(" & ") + " \\\\");
      }
    }
    out.push("\\bottomrule");
  } else {
    out.push(`\\begin{tabular}{${spec}}`);
    for (const r of rows) {
      out.push(r.map(convertInline).join(" & ") + " \\\\");
      out.push("\\hline");
    }
  }
  out.push("\\end{tabular}");
  out.push("\\end{table}");
  return { latex: out.join("\n"), next: i };
}

function convertList(lines: string[], start: number): { latex: string; next: number } {
  const first = lines[start].trim();
  const ordered = /^\d+\.\s+/.test(first);
  const env = ordered ? "enumerate" : "itemize";
  const out: string[] = [`\\begin{${env}}`];
  let i = start;
  while (i < lines.length) {
    const line = lines[i].trim();
    const bullet = ordered ? /^\d+\.\s+(.*)$/ : /^[-*+]\s+(.*)$/;
    const m = line.match(bullet);
    if (!m) break;
    out.push(`  \\item ${convertInline(m[1])}`);
    i += 1;
  }
  out.push(`\\end{${env}}`);
  return { latex: out.join("\n"), next: i };
}

/**
 * Convert a Markdown fragment into a LaTeX paper fragment.
 */
export function markdownToLatex(markdown: string, options: MdConvertOptions = {}): MdConvertResult {
  const warnings: string[] = [];
  const offset = options.headingOffset ?? 0;
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inFence = false;
  let fenceBuf: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(" ").trim();
    if (text) out.push(convertInline(text));
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // fenced code
    if (trimmed.startsWith("```")) {
      flushPara();
      if (!inFence) {
        inFence = true;
        fenceBuf = [];
      } else {
        out.push("\\begin{verbatim}");
        out.push(...fenceBuf);
        out.push("\\end{verbatim}");
        inFence = false;
        fenceBuf = [];
      }
      i += 1;
      continue;
    }
    if (inFence) {
      fenceBuf.push(line);
      i += 1;
      continue;
    }

    // math block
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
      flushPara();
      out.push("\\[");
      out.push(trimmed.slice(2, -2).trim());
      out.push("\\]");
      i += 1;
      continue;
    }
    if (trimmed === "$$") {
      flushPara();
      i += 1;
      const math: string[] = [];
      while (i < lines.length && lines[i].trim() !== "$$") {
        math.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push("\\[");
      out.push(math.join("\n"));
      out.push("\\]");
      continue;
    }

    // headings
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      const level = h[1].length;
      out.push(`${headingCommand(level, offset)}{${convertInline(h[2])}}`);
      out.push("");
      i += 1;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushPara();
      out.push("\\bigskip");
      i += 1;
      continue;
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      flushPara();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      out.push("\\begin{quote}");
      out.push(convertInline(quote.join(" ")));
      out.push("\\end{quote}");
      out.push("");
      continue;
    }

    // table
    if (isTableRow(trimmed) && i + 1 < lines.length && isTableRow(lines[i + 1])) {
      flushPara();
      const t = convertTable(lines, i, options);
      out.push(t.latex);
      out.push("");
      i = t.next;
      continue;
    }

    // list
    if (/^([-*+]|\d+\.)\s+/.test(trimmed)) {
      flushPara();
      const l = convertList(lines, i);
      out.push(l.latex);
      out.push("");
      i = l.next;
      continue;
    }

    // blank
    if (!trimmed) {
      flushPara();
      i += 1;
      continue;
    }

    para.push(trimmed);
    i += 1;
  }

  flushPara();
  if (inFence) warnings.push("未闭合的代码围栏，已按段落处理");

  return { latex: out.join("\n"), warnings };
}
