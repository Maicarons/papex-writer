import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { markdownToLatex } from "@md-to-latex/index";
import { FileCode2, Upload } from "lucide-react";

export function MdConvertToolbar() {
  const openMdPreview = useApp((s) => s.openMdPreview);
  const activeSection = useApp((s) => s.activeSection);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const convert = (md: string) => {
    const r = markdownToLatex(md);
    openMdPreview(r.latex, activeSection);
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,text/markdown"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const text = await f.text();
          convert(text);
          e.target.value = "";
        }}
      />
      <Button size="sm" variant="outline" className="h-7" onClick={() => fileRef.current?.click()}>
        <Upload className="h-3.5 w-3.5" /> 导入 MD
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7"
        onClick={() => {
          void navigator.clipboard.readText().then((text) => {
            if (text) convert(text);
          });
        }}
      >
        <FileCode2 className="h-3.5 w-3.5" /> 粘贴转写
      </Button>
    </>
  );
}

export function MdPreviewDialog() {
  const { mdPreview, closeMdPreview, insertMdLatex } = useApp();
  if (!mdPreview.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex max-h-[80vh] w-[720px] flex-col overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Markdown → 论文片段</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              目标：{mdPreview.target || "当前章节"} · 规则引擎转写结果预览
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          <pre className="whitespace-pre-wrap rounded-md bg-[hsl(var(--muted))] p-3 font-mono text-xs leading-5">
            {mdPreview.latex || "（空）"}
          </pre>
        </div>
        <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] px-4 py-3">
          <Button variant="outline" onClick={closeMdPreview}>
            取消
          </Button>
          <Button variant="cta" onClick={insertMdLatex}>
            插入到章节
          </Button>
        </div>
      </div>
    </div>
  );
}
