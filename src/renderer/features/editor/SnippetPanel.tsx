import * as React from "react";
import { Button } from "@/components/ui/button";

const SNIPPETS: { id: string; label: string; insert: string }[] = [
  {
    id: "section",
    label: "章节",
    insert: "\n\\section{标题}\n\n内容…\n",
  },
  {
    id: "subsection",
    label: "子节",
    insert: "\n\\subsection{标题}\n\n内容…\n",
  },
  {
    id: "thm",
    label: "定理",
    insert: "\n\\begin{theorem}\n  定理内容。\n\\end{theorem}\n",
  },
  {
    id: "lemma",
    label: "引理",
    insert: "\n\\begin{lemma}\n  引理内容。\n\\end{lemma}\n",
  },
  {
    id: "proof",
    label: "证明",
    insert: "\n\\begin{proof}\n  证明过程。\n\\end{proof}\n",
  },
  {
    id: "figure",
    label: "插图",
    insert:
      "\n\\begin{figure}[htbp]\n\\centering\n\\includegraphics[width=0.8\\linewidth]{assets/fig.png}\n\\caption{说明}\n\\label{fig:xxx}\n\\end{figure}\n",
  },
  {
    id: "table",
    label: "表格",
    insert:
      "\n\\begin{table}[htbp]\n\\centering\n\\caption{说明}\n\\label{tab:xxx}\n\\begin{tabular}{ll}\n\\toprule\nA & B \\\\\n\\midrule\n1 & 2 \\\\\n\\bottomrule\n\\end{tabular}\n\\end{table}\n",
  },
  {
    id: "algorithm",
    label: "算法",
    insert:
      "\n\\begin{algorithm}[htbp]\n\\caption{算法名}\n\\begin{algorithmic}\n\\Require 输入\n\\Ensure 输出\n\\State 步骤\n\\end{algorithmic}\n\\end{algorithm}\n",
  },
  {
    id: "eq",
    label: "公式",
    insert: "\n\\begin{equation}\n  E=mc^2\n  \\label{eq:xxx}\n\\end{equation}\n",
  },
  {
    id: "itemize",
    label: "列表",
    insert: "\n\\begin{itemize}\n  \\item 条目一\n  \\item 条目二\n\\end{itemize}\n",
  },
  {
    id: "footnote",
    label: "脚注",
    insert: "\\footnote{脚注内容}",
  },
  {
    id: "cite",
    label: "引用",
    insert: "\\cite{key}",
  },
];

export function SnippetPanel({ onInsert }: { onInsert: (snippet: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1.5">
      <span className="mr-1 text-[10px] text-[hsl(var(--muted-foreground))]">插入</span>
      {SNIPPETS.map((s) => (
        <Button
          key={s.id}
          size="sm"
          variant="outline"
          className="h-6 px-2 text-[11px]"
          onClick={() => onInsert(s.insert)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}

export { SNIPPETS };
