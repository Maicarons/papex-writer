import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { OutlineList } from "@/features/editor/OutlineList";
import { PdfPanel } from "@/features/compile/PdfPanel";
import { AiPanel } from "@/features/ai/AiPanel";

const TABS = [
  { id: "outline", label: "大纲" },
  { id: "pdf", label: "PDF" },
  { id: "ai", label: "AI" },
] as const;

export function RightDock() {
  const rightTab = useApp((s) => s.rightTab);
  const setRightTab = useApp((s) => s.setRightTab);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center gap-1 border-b border-[hsl(var(--border))] p-2">
        {TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={rightTab === t.id ? "secondary" : "ghost"}
            className="h-7"
            onClick={() => setRightTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {rightTab === "outline" && <OutlineList />}
        {rightTab === "pdf" && <PdfPanel />}
        {rightTab === "ai" && <AiPanel />}
      </div>
    </aside>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
      {children}
    </div>
  );
}

export function EmptyHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-xs text-[hsl(var(--muted-foreground))]", className)}>
      {children}
    </div>
  );
}
