import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PapexReference, RefType } from "@latex-core/types";
import { Plus, Trash2, Quote } from "lucide-react";

export function RefsPanel() {
  const { manifest, setManifest, files, setSectionContent, activeSection } = useApp();
  const [key, setKey] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [year, setYear] = React.useState("");

  const add = () => {
    if (!key.trim()) return;
    const ref: PapexReference = {
      key: key.trim(),
      type: "article" as RefType,
      title: title.trim(),
      author: author.trim(),
      year: year ? Number(year) : undefined,
    };
    setManifest({ ...manifest, references: [...(manifest.references ?? []), ref] });
    setKey("");
    setTitle("");
    setAuthor("");
    setYear("");
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <h2 className="font-heading text-2xl font-bold">参考文献</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            BibTeX 条目 · 在正文用 \cite&#123;key&#125; 引用
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">添加条目</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Input placeholder="key（如 vaswani2017）" value={key} onChange={(e) => setKey(e.target.value)} />
            <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="作者" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Input placeholder="年份" value={year} onChange={(e) => setYear(e.target.value)} />
            <Button onClick={add} className="col-span-2">
              <Plus className="h-3.5 w-3.5" /> 添加
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {(manifest.references ?? []).map((r, i) => (
            <Card key={r.key + i}>
              <CardContent className="flex items-start gap-2 pt-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs text-[hsl(var(--primary))]">
                      {r.key}
                    </code>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{r.type}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    {[r.author, r.year].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7"
                  onClick={() => {
                    const snippet = `\\cite{${r.key}}`;
                    setSectionContent(activeSection, (files[activeSection] ?? "") + snippet);
                  }}
                  title="插入引用"
                >
                  <Quote className="h-3 w-3" /> 引用
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[hsl(var(--destructive))]"
                  onClick={() =>
                    setManifest({
                      ...manifest,
                      references: (manifest.references ?? []).filter((x) => x.key !== r.key),
                    })
                  }
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {!(manifest.references ?? []).length && (
            <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              文献库为空。添加第一条参考文献。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
