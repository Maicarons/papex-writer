import * as React from "react";
import { useApp } from "@/stores/app-store";
import { filesToDocs, search } from "@shared/search";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/shell/RightDock";

export function SearchPanel() {
  const files = useApp((s) => s.files);
  const manifest = useApp((s) => s.manifest);
  const setView = useApp((s) => s.setView);
  const setActiveSection = useApp((s) => s.setActiveSection);
  const setRevealLine = useApp((s) => s.setRevealLine);
  const [q, setQ] = React.useState("");
  const [limit] = React.useState(20);

  const titles = React.useMemo(() => {
    const t: Record<string, string> = {};
    for (const s of manifest.sections) t[s.file] = s.title ?? s.file;
    return t;
  }, [manifest]);

  const docs = React.useMemo(() => filesToDocs(files, titles), [files, titles]);
  const hits = React.useMemo(() => (q.trim() ? search(docs, q, limit) : []), [docs, q, limit]);

  return (
    <div>
      <SectionTitle>全文检索</SectionTitle>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索章节内容…"
        className="mb-2"
      />
      <div className="space-y-1">
        {hits.map((h) => (
          <button
            key={h.id + h.line + h.score}
            className="w-full rounded-md border border-[hsl(var(--border))] p-2 text-left hover:bg-[hsl(var(--muted))]"
            onClick={() => {
              setActiveSection(h.path);
              setRevealLine(h.line);
              setView("editor");
            }}
          >
            <div className="flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
              <span className="truncate">{h.title}</span>
              <span>L{h.line}</span>
            </div>
            <div className="mt-0.5 line-clamp-2 text-xs">{h.snippet}</div>
          </button>
        ))}
        {q.trim() && !hits.length && (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">无匹配</div>
        )}
        {!q.trim() && (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            输入关键词检索全部章节
          </div>
        )}
      </div>
    </div>
  );
}
