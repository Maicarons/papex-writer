import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";

const COMMANDS = [
  { id: "save", label: "保存项目", run: () => void useApp.getState().saveProject() },
  { id: "compile", label: "编译项目", run: () => void useApp.getState().runCompile() },
  { id: "export", label: "导出投稿包", run: () => void useApp.getState().exportArchive() },
  { id: "visual", label: "切换 Visual / 源码", run: () => {
    const s = useApp.getState();
    s.setEditorMode(s.editorMode === "source" ? "visual" : "source");
  }},
  { id: "ideation", label: "打开创意库", run: () => useApp.getState().setView("ideation") },
  { id: "meta", label: "编辑元数据", run: () => useApp.getState().setView("meta") },
  { id: "refs", label: "打开文献库", run: () => useApp.getState().setView("refs") },
  { id: "ai", label: "打开 AI 面板", run: () => useApp.getState().setRightTab("ai") },
  { id: "pdf", label: "打开 PDF 预览", run: () => useApp.getState().setRightTab("pdf") },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  if (!open) return null;

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-[480px] overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && filtered[0]) {
              filtered[0].run();
              onClose();
            }
          }}
          placeholder="输入命令…"
          className="w-full border-b border-[hsl(var(--border))] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <div className="max-h-[320px] overflow-auto p-1">
          {filtered.map((c) => (
            <button
              key={c.id}
              className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[hsl(var(--accent))]"
              onClick={() => {
                c.run();
                onClose();
              }}
            >
              {c.label}
            </button>
          ))}
          {!filtered.length && (
            <div className="px-3 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              无匹配命令
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-3 py-2 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span>Ctrl+Shift+P 打开 · Enter 执行 · Esc 关闭</span>
          <Button size="sm" variant="ghost" className="h-6 px-2" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
