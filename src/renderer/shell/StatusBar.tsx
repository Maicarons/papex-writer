import { useApp } from "@/stores/app-store";

export function StatusBar({ status, section }: { status: string; section: string }) {
  const compile = useApp((s) => s.compile);
  return (
    <footer className="flex h-7 items-center gap-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 text-[11px] text-[hsl(var(--muted-foreground))]">
      <span>{status}</span>
      <span className="opacity-60">|</span>
      <span className="truncate">{section}</span>
      <span className="ml-auto flex items-center gap-2">
        {compile.running ? (
          <span className="text-[hsl(var(--secondary))]">编译中…</span>
        ) : compile.ok ? (
          <span className="text-[hsl(var(--cta))]">PDF 就绪</span>
        ) : compile.errors.length ? (
          <span className="text-[hsl(var(--destructive))]">{compile.errors.length} 个问题</span>
        ) : null}
        <span>Papex Writer 0.1.0</span>
      </span>
    </footer>
  );
}
