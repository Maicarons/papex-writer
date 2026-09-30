import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { CodeMirrorEditor, type CompletionSourceData } from "./CodeMirrorEditor";
import { VisualEditor } from "./VisualEditor";
import { MdConvertToolbar } from "../md-convert/MdConvertToolbar";
import { SnippetPanel } from "./SnippetPanel";
import { ReviewToolbar } from "../review/ReviewToolbar";
import { Sparkles, Table2 } from "lucide-react";
import { TableGeneratorDialog } from "./TableGeneratorDialog";
import { countWords } from "@/lib/word-count";

export function EditorPanel() {
  const {
    files,
    activeSection,
    setSectionContent,
    editorMode,
    manifest,
    setAiOutput,
    setAiRunning,
    revealLine,
  } = useApp();
  const content = files[activeSection] ?? "";
  const section = manifest.sections.find((s) => s.file === activeSection);
  const [showTable, setShowTable] = React.useState(false);
  const [showSnippets, setShowSnippets] = React.useState(false);

  const completionData = React.useMemo<CompletionSourceData>(() => {
    const labels: string[] = [];
    const text = Object.values(files).join("\n");
    for (const m of text.matchAll(/\\label\{([^}]+)\}/g)) labels.push(m[1]);
    return {
      citeKeys: (manifest.references ?? []).map((r) => r.key),
      labels: [...new Set(labels)],
      sectionFiles: manifest.sections.map((s) => s.file.replace(/\.tex$/, "")),
      assets: [], // filled from project files later
    };
  }, [files, manifest]);

  const stats = React.useMemo(() => countWords(content), [content]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center gap-2 border-b border-[hsl(var(--border))] px-3">
        <div className="text-sm font-medium">{section?.title ?? activeSection}</div>
        <div className="ml-auto flex items-center gap-1">
          <span className="mr-2 text-[11px] text-[hsl(var(--muted-foreground))]">
            {stats.words} 词 · {stats.chars} 字符
          </span>
          <MdConvertToolbar />
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => setShowSnippets((v) => !v)}
          >
            Snippet
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => setShowTable(true)}>
            <Table2 className="h-3.5 w-3.5" /> 表格
          </Button>
          <ReviewToolbar />
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => {
              setAiRunning(true);
              setAiOutput(
                "【离线占位】选区润色结果示例。\n\n配置 AI 端点（设置 → AI）后，此处显示流式模型输出：更学术、更连贯，并保留 \\cite{} 与公式。",
              );
              setAiRunning(false);
              useApp.getState().setRightTab("ai");
            }}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI 润色
          </Button>
        </div>
      </div>

      {showSnippets && <SnippetPanel onInsert={(t) => setSectionContent(activeSection, content + t)} />}

      <div className="min-h-0 flex-1">
        {editorMode === "source" ? (
          <CodeMirrorEditor
            value={content}
            onChange={(v) => setSectionContent(activeSection, v)}
            completionData={completionData}
            revealLine={revealLine}
            placeholder="在此撰写 LaTeX 章节…"
          />
        ) : (
          <VisualEditor value={content} onChange={(v) => setSectionContent(activeSection, v)} />
        )}
      </div>

      {showTable && (
        <TableGeneratorDialog
          onClose={() => setShowTable(false)}
          onInsert={(latex) => {
            setSectionContent(activeSection, content + "\n" + latex + "\n");
            setShowTable(false);
          }}
        />
      )}

      {/* clear reveal after jump */}
      {revealLine ? (
        <ClearReveal />
      ) : null}
    </div>
  );
}

function ClearReveal() {
  const setRevealLine = useApp((s) => s.setRevealLine);
  React.useEffect(() => {
    const t = setTimeout(() => setRevealLine(null), 500);
    return () => clearTimeout(t);
  }, [setRevealLine]);
  return null;
}
