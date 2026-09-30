import * as React from "react";

/**
 * Visual (WYSIWYG) mode: source is the single truth.
 * We project LaTeX source into rich blocks and write edits back as LaTeX.
 */
export function VisualEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const blocks = React.useMemo(() => parseBlocks(value), [value]);
  const [selected, setSelected] = React.useState<number | null>(null);

  return (
    <div className="h-full overflow-auto bg-[hsl(var(--background))] p-6">
      <div className="mx-auto max-w-[820px] space-y-4">
        <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5">
          <VBtn onApply={(t) => onChange(value + t)}>标题</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>加粗</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>斜体</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>列表</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>公式</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>引用</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>表格</VBtn>
          <VBtn onApply={(t) => onChange(value + t)}>图</VBtn>
        </div>

        {blocks.map((b, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className={
              "rounded-md transition-shadow " +
              (selected === i
                ? "ring-2 ring-[hsl(var(--ring))]"
                : "hover:ring-1 hover:ring-[hsl(var(--border))]")
            }
          >
            {b.type === "h1" && (
              <div className="px-2 py-1 font-heading text-2xl font-bold">{b.text}</div>
            )}
            {b.type === "h2" && (
              <div className="px-2 py-1 font-heading text-xl font-semibold">{b.text}</div>
            )}
            {b.type === "h3" && (
              <div className="px-2 py-1 font-heading text-lg font-medium">{b.text}</div>
            )}
            {b.type === "para" && (
              <div className="px-2 py-1 text-[15px] leading-7" dangerouslySetInnerHTML={{ __html: b.html }} />
            )}
            {b.type === "ul" && (
              <ul className="list-disc space-y-1 px-6 py-1 text-[15px] leading-7">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            )}
            {b.type === "ol" && (
              <ol className="list-decimal space-y-1 px-6 py-1 text-[15px] leading-7">
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            )}
            {b.type === "math" && (
              <div className="my-2 rounded-md bg-[hsl(var(--muted))] px-4 py-3 text-center font-mono text-[hsl(var(--primary))]">
                {b.text}
              </div>
            )}
            {b.type === "code" && (
              <pre className="overflow-auto rounded-md bg-[hsl(var(--muted))] p-3 font-mono text-xs">
                {b.text}
              </pre>
            )}
            {b.type === "chip" && (
              <div className="px-2 py-1">
                <span className="inline-flex items-center rounded-md border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-1 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
                  {"{" + b.text + "}"}
                </span>
              </div>
            )}
          </div>
        ))}

        {!blocks.length && (
          <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            空文档。使用上方工具栏插入标题、段落或公式。
          </div>
        )}
      </div>
    </div>
  );
}

function VBtn({ children, onApply }: { children: React.ReactNode; onApply: (snippet: string) => void }) {
  const snippets: Record<string, string> = {
    标题: "\n\\section{新标题}\n\n",
    加粗: "\n\\textbf{加粗文本}\n",
    斜体: "\n\\emph{强调文本}\n",
    列表: "\n\\begin{itemize}\n  \\item 条目\n\\end{itemize}\n",
    公式: "\n\\[\n  E=mc^2\n\\]\n",
    引用: "\n\\cite{key}\n",
    表格:
      "\n\\begin{table}[htbp]\n\\centering\n\\begin{tabular}{ll}\n\\toprule\nA & B \\\\\n\\midrule\n1 & 2 \\\\\n\\bottomrule\n\\end{tabular}\n\\end{table}\n",
    图: "\n\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\linewidth]{assets/fig.png}\n\\caption{说明}\n\\end{figure}\n",
  };
  const label = typeof children === "string" ? children : "插入";
  return (
    <button
      type="button"
      className="rounded-md px-2.5 py-1 text-xs hover:bg-[hsl(var(--accent))]"
      onClick={() => onApply(snippets[label] ?? "\n")}
    >
      {children}
    </button>
  );
}

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "para"; text: string; html: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "math" | "code" | "chip"; text: string };

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }
    const sec = t.match(/^\\(section|subsection|subsubsection)\{(.*)\}\s*$/);
    if (sec) {
      const type = sec[1] === "section" ? "h1" : sec[1] === "subsection" ? "h2" : "h3";
      blocks.push({ type, text: sec[2] });
      i++;
      continue;
    }
    if (t === "\\[" || t === "$$") {
      const math: string[] = [];
      i++;
      while (i < lines.length && !["\\]", "$$"].includes(lines[i].trim())) {
        math.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "math", text: math.join(" ").trim() });
      continue;
    }
    if (t.startsWith("\\begin{itemize}")) {
      const items: string[] = [];
      i++;
      while (i < lines.length && !lines[i].includes("\\end{itemize}")) {
        const m = lines[i].trim().match(/^\\item\s+(.*)$/);
        if (m) items.push(inlineToHtml(m[1]));
        i++;
      }
      i++;
      blocks.push({ type: "ul", items });
      continue;
    }
    if (t.startsWith("\\begin{enumerate}")) {
      const items: string[] = [];
      i++;
      while (i < lines.length && !lines[i].includes("\\end{enumerate}")) {
        const m = lines[i].trim().match(/^\\item\s+(.*)$/);
        if (m) items.push(inlineToHtml(m[1]));
        i++;
      }
      i++;
      blocks.push({ type: "ol", items });
      continue;
    }
    if (t.startsWith("\\begin{verbatim}")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].includes("\\end{verbatim}")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }
    if (t.startsWith("\\begin{")) {
      // chip for complex envs — show until matching end
      const env = t.match(/^\\begin\{([^}]+)\}/)?.[1] ?? "env";
      const buf: string[] = [t];
      i++;
      while (i < lines.length && !lines[i].includes(`\\end{${env}}`)) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) buf.push(lines[i++]);
      blocks.push({ type: "chip", text: buf.join(" / ").slice(0, 80) });
      continue;
    }
    // paragraph accumulation
    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (
        !l ||
        /^\\(section|subsection|subsubsection)\{/.test(l) ||
        /^\\begin\{/.test(l) ||
        l === "\\[" ||
        l === "$$"
      )
        break;
      para.push(l);
      i++;
    }
    const text = para.join(" ");
    if (text) blocks.push({ type: "para", text, html: inlineToHtml(text) });
  }
  return blocks;
}

function inlineToHtml(src: string): string {
  return src
    .replace(/\\textbf\{([^}]+)\}/g, "<strong>$1</strong>")
    .replace(/\\emph\{([^}]+)\}/g, "<em>$1</em>")
    .replace(/\\cite\{([^}]+)\}/g, '<span style="color:var(--primary)">[$1]</span>')
    .replace(/\\ref\{([^}]+)\}/g, '<span style="color:var(--primary)">[$1]</span>')
    .replace(/\\texttt\{([^}]+)\}/g, "<code>$1</code>")
    .replace(/\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, (m) => m)
    .replace(/([&%$#_])/g, "$1");
}
