import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

export function OutlineList() {
  const { manifest, activeSection, setActiveSection, addSection, removeSection, moveSection } =
    useApp();
  const [title, setTitle] = React.useState("");

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        章节结构
      </div>
      <div className="space-y-1">
        {manifest.sections.map((s) => (
          <div
            key={s.file}
            className={cn(
              "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm",
              activeSection === s.file
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                : "hover:bg-[hsl(var(--muted))]",
            )}
          >
            <button className="min-w-0 flex-1 truncate text-left" onClick={() => setActiveSection(s.file)}>
              {s.title ?? s.file}
            </button>
            <button
              className="opacity-0 group-hover:opacity-100"
              onClick={() => moveSection(s.file, -1)}
              title="上移"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              className="opacity-0 group-hover:opacity-100"
              onClick={() => moveSection(s.file, 1)}
              title="下移"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              className="opacity-0 group-hover:opacity-100 text-[hsl(var(--destructive))]"
              onClick={() => removeSection(s.file)}
              title="删除"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新章节标题"
          className="h-8 flex-1 rounded-md border border-[hsl(var(--input))] bg-transparent px-2 text-xs"
        />
        <Button
          size="sm"
          className="h-8"
          onClick={() => {
            if (!title.trim()) return;
            addSection(title.trim());
            setTitle("");
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
        {manifest.sections.length} 个章节 · 与 papex.json.sections 同步
      </div>
    </div>
  );
}
