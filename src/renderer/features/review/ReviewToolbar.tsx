import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { createId, nowIso } from "@shared/id";
import { MessageSquarePlus, History, Check, X } from "lucide-react";

export function ReviewToolbar() {
  const {
    writer,
    files,
    activeSection,
    setAiOutput,
    setRightTab,
  } = useApp();
  const [showReview, setShowReview] = React.useState(false);

  const addComment = () => {
    const body = window.prompt("批注内容");
    if (!body) return;
    const content = files[activeSection] ?? "";
    // use cursor-less full-section anchor as simplified selection
    const from = 0;
    const to = Math.min(content.length, 80);
    useApp.getState().addComment({
      id: createId(),
      section: activeSection,
      from,
      to,
      body,
      resolved: false,
      createdAt: nowIso(),
    });
  };

  const createSnapshot = () => {
    const label = window.prompt("快照标签", `快照 ${writer.snapshots.length + 1}`);
    if (!label) return;
    useApp.getState().addSnapshot(label);
    useApp.getState().setStatus(`已创建快照「${label}」`);
  };

  return (
    <>
      <Button size="sm" variant="outline" className="h-7" onClick={addComment} title="添加批注">
        <MessageSquarePlus className="h-3.5 w-3.5" /> 批注
      </Button>
      <Button size="sm" variant="outline" className="h-7" onClick={createSnapshot} title="版本快照">
        <History className="h-3.5 w-3.5" /> 快照
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7"
        onClick={() => setShowReview((v) => !v)}
      >
        审阅
      </Button>

      {showReview && (
        <div className="absolute right-0 top-10 z-30 w-[320px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-3 shadow-lg">
          <div className="mb-2 text-xs font-semibold">
            批注（{writer.review.comments.length}） / 快照（{writer.snapshots.length}）
          </div>
          <div className="max-h-[200px] space-y-1 overflow-auto">
            {writer.review.comments.map((c) => (
              <div key={c.id} className="rounded-md border border-[hsl(var(--border))] p-2 text-[11px]">
                <div className="flex items-start justify-between gap-1">
                  <span className="whitespace-pre-wrap">{c.body}</span>
                  <button
                    className="text-[hsl(var(--cta))]"
                    onClick={() => useApp.getState().resolveComment(c.id)}
                    title="解决"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                  {c.section} {c.resolved ? "· 已解决" : ""}
                </div>
              </div>
            ))}
            {!writer.review.comments.length && (
              <div className="text-[11px] text-[hsl(var(--muted-foreground))]">暂无批注</div>
            )}
          </div>

          <div className="mt-2 border-t border-[hsl(var(--border))] pt-2">
            <div className="mb-1 text-[10px] text-[hsl(var(--muted-foreground))]">版本快照</div>
            {writer.snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-[11px]">
                <span>{s.label}</span>
                <button
                  className="text-[hsl(var(--primary))] hover:underline"
                  onClick={() => {
                    if (window.confirm(`恢复快照「${s.label}」？当前未保存内容可能丢失。`)) {
                      useApp.getState().restoreSnapshot(s.id);
                      setShowReview(false);
                    }
                  }}
                >
                  恢复
                </button>
              </div>
            ))}
            {!writer.snapshots.length && (
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">暂无快照</div>
            )}
          </div>

          <div className="mt-2 flex justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px]"
              onClick={() => {
                setAiOutput(
                  `审阅清单（离线）：\n- 检查图表引用是否完整\n- 术语是否统一\n- 摘要与结论是否对齐\n\n批注 ${writer.review.comments.length} 条`,
                );
                setRightTab("ai");
                setShowReview(false);
              }}
            >
              AI 审阅
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setShowReview(false)}>
              <X className="h-3 w-3" /> 关闭
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
