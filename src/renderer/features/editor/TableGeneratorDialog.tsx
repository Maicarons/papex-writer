import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TableGeneratorDialog({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (latex: string) => void;
}) {
  const [rows, setRows] = React.useState(3);
  const [cols, setCols] = React.useState(2);
  const [caption, setCaption] = React.useState("实验结果");
  const [label, setLabel] = React.useState("tab:results");
  const [header, setHeader] = React.useState("A,B");
  const [data, setData] = React.useState("1,2\n3,4");

  const build = (): string => {
    const headers = header.split(",").map((h) => h.trim());
    const body = data
      .split("\n")
      .map((line) => line.split(",").map((c) => c.trim()));
    const colSpec = "l".repeat(Math.max(cols, headers.length));
    const lines: string[] = [];
    lines.push("\\begin{table}[htbp]");
    lines.push("\\centering");
    lines.push(`\\caption{${caption}}`);
    lines.push(`\\label{${label}}`);
    lines.push(`\\begin{tabular}{${colSpec}}`);
    lines.push("\\toprule");
    if (headers.length) lines.push(headers.join(" & ") + " \\\\");
    lines.push("\\midrule");
    for (const row of body.slice(0, rows + 5)) {
      if (row.some((c) => c !== "")) lines.push(row.join(" & ") + " \\\\");
    }
    lines.push("\\bottomrule");
    lines.push("\\end{tabular}");
    lines.push("\\end{table}");
    return lines.join("\n");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[560px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-4 shadow-xl">
        <div className="mb-3 text-sm font-semibold">表格生成器（booktabs）</div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs">
            行数
            <Input
              type="number"
              value={rows}
              min={1}
              max={20}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </label>
          <label className="text-xs">
            列数
            <Input
              type="number"
              value={cols}
              min={1}
              max={8}
              onChange={(e) => setCols(Number(e.target.value))}
            />
          </label>
          <label className="text-xs">
            表题
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
          <label className="text-xs">
            Label
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="col-span-2 text-xs">
            表头（逗号分隔）
            <Input value={header} onChange={(e) => setHeader(e.target.value)} />
          </label>
          <label className="col-span-2 text-xs">
            数据（每行逗号分隔）
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="mt-1 h-24 w-full rounded-md border border-[hsl(var(--input))] bg-transparent p-2 font-mono text-xs"
            />
          </label>
        </div>
        <pre className="mt-3 max-h-[120px] overflow-auto rounded-md bg-[hsl(var(--muted))] p-2 font-mono text-[10px]">
          {build()}
        </pre>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button variant="cta" size="sm" onClick={() => onInsert(build())}>
            插入表格
          </Button>
        </div>
      </div>
    </div>
  );
}
