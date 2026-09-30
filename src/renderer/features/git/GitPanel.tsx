import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/shell/RightDock";
import { GitBranch, RefreshCw, GitCommit } from "lucide-react";

interface GitSnap {
  ok: boolean;
  branch?: string;
  clean?: boolean;
  entries: { code: string; path: string }[];
  error?: string;
}

export function GitPanel() {
  const root = useApp((s) => s.root);
  const setStatus = useApp((s) => s.setStatus);
  const [snap, setSnap] = React.useState<GitSnap | null>(null);
  const [busy, setBusy] = React.useState(false);

  const refresh = async () => {
    if (!root) return;
    setBusy(true);
    try {
      const r = (await (window as any).writer?.gitStatus?.(root)) as GitSnap | null;
      setSnap(r ?? { ok: false, entries: [], error: "git API unavailable" });
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <SectionTitle>Git</SectionTitle>
        <Button size="sm" variant="ghost" className="h-7" disabled={busy} onClick={() => void refresh()}>
          <RefreshCw className={"h-3 w-3 " + (busy ? "animate-spin" : "")} />
        </Button>
      </div>
      {snap?.ok ? (
        <>
          <div className="mb-2 flex items-center gap-1 text-xs">
            <GitBranch className="h-3 w-3" />
            <span>{snap.branch}</span>
            <span className={snap.clean ? "text-[hsl(var(--cta))]" : "text-amber-500"}>
              {snap.clean ? "· clean" : `· ${snap.entries.length} changes`}
            </span>
          </div>
          <div className="max-h-[160px] space-y-0.5 overflow-auto">
            {snap.entries.map((e) => (
              <div key={e.path} className="flex gap-2 font-mono text-[10px]">
                <span className="w-6 text-[hsl(var(--muted-foreground))]">{e.code}</span>
                <span className="truncate">{e.path}</span>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 w-full"
            onClick={async () => {
              const msg = window.prompt("提交信息", "update paper sources");
              if (!msg || !root) return;
              const r = (await (window as any).writer?.gitCommit?.(root, msg)) as {
                ok: boolean;
                out: string;
              };
              setStatus(r?.ok ? "已提交" : `提交失败：${r?.out?.slice(0, 80) ?? ""}`);
              void refresh();
            }}
          >
            <GitCommit className="h-3 w-3" /> 提交全部
          </Button>
        </>
      ) : (
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          {snap?.error ?? "打开项目后显示 git 状态"}
        </div>
      )}
    </div>
  );
}
