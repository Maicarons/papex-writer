import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { VisualEditor } from "./VisualEditor";
import { MdConvertToolbar } from "../md-convert/MdConvertToolbar";
import { Sparkles, Wand2 } from "lucide-react";

export function EditorPanel() {
  const {
    files,
    activeSection,
    setSectionContent,
    editorMode,
    manifest,
    setAiOutput,
    setAiRunning,
  } = useApp();
  const content = files[activeSection] ?? "";
  const section = manifest.sections.find((s) => s.file === activeSection);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-[hsl(var(--border))] px-3">
        <div className="text-sm font-medium">{section?.title ?? activeSection}</div>
        <div className="ml-auto flex items-center gap-1">
          <MdConvertToolbar />
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => {
              void (async () => {
                setAiRunning(true);
                setAiOutput("（可配置 AI 端点后使用润色；当前为离线提示）\n\n选区学术化建议：可在此插入模型输出。");
                setAiRunning(false);
                useApp.getState().setRightTab("ai");
              })();
            }}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI 润色
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={() => {
              // wrap selection-like insertion
              const insert = "\n\\textbf{重点}\n";
              setSectionContent(activeSection, content + insert);
            }}
          >
            <Wand2 className="h-3.5 w-3.5" /> 插入强调
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {editorMode === "source" ? (
          <SourceEditor value={content} onChange={(v) => setSectionContent(activeSection, v)} />
        ) : (
          <VisualEditor
            value={content}
            onChange={(v) => setSectionContent(activeSection, v)}
          />
        )}
      </div>
    </div>
  );
}

function SourceEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      className={cn(
        "h-full w-full resize-none bg-[hsl(var(--background))] p-4 font-mono text-[13px] leading-6",
        "outline-none focus:ring-0",
      )}
    />
  );
}
