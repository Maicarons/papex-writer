import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { EmptyHint, SectionTitle } from "@/shell/RightDock";
import { AlertTriangle, FileText, Play, Sparkles } from "lucide-react";

export function PdfPanel() {
  const compile = useApp((s) => s.compile);
  const runCompile = useApp((s) => s.runCompile);
  const setAiOutput = useApp((s) => s.setAiOutput);
  const setRightTab = useApp((s) => s.setRightTab);

  return (
    <div className="space-y-3">
      <SectionTitle>编译</SectionTitle>
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8" disabled={compile.running} onClick={() => void runCompile()}>
          <Play className="h-3 w-3" /> {compile.running ? "编译中…" : "编译"}
        </Button>
        {compile.ok && (
          <span className="text-xs text-[hsl(var(--cta))]">
            成功 · {Math.round(compile.durationMs / 1000)}s
          </span>
        )}
      </div>

      {compile.pdfPath ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] p-2 text-xs">
            <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="truncate">{compile.pdfPath}</span>
          </div>
          <div className="h-[280px] overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white">
            {/* file:// iframe works in Electron for local PDF */}
            <iframe
              title="pdf"
              src={compile.pdfPath}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      ) : (
        <EmptyHint>编译后在此预览 PDF</EmptyHint>
      )}

      {compile.errors.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>问题（{compile.errors.length}）</SectionTitle>
          {compile.errors.slice(0, 20).map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-[hsl(var(--border))] p-2 text-xs"
            >
              <AlertTriangle
                className={
                  e.level === "error" ? "mt-0.5 h-3 w-3 text-[hsl(var(--destructive))]" : "mt-0.5 h-3 w-3 text-amber-500"
                }
              />
              <div className="min-w-0">
                <div>
                  {e.file ? `${e.file}${e.line ? `:${e.line}` : ""} — ` : ""}
                  {e.message}
                </div>
                <button
                  className="mt-1 text-[hsl(var(--primary))] hover:underline"
                  onClick={() => {
                    setAiOutput(`错误：${e.message}\n\n（离线提示）常见原因：未定义命令、缺少包、括号不匹配。配置 AI 端点后可获得针对性修复建议。`);
                    setRightTab("ai");
                  }}
                >
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  AI 解释
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {compile.log && (
        <details className="text-xs">
          <summary className="cursor-pointer text-[hsl(var(--muted-foreground))]">编译日志</summary>
          <pre className="mt-2 max-h-[200px] overflow-auto whitespace-pre-wrap rounded-md bg-[hsl(var(--muted))] p-2 font-mono text-[10px]">
            {compile.log.slice(-8000)}
          </pre>
        </details>
      )}
    </div>
  );
}
