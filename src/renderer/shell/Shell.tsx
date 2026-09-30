import * as React from "react";
import { useApp, type AppView } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { t as tr } from "@/i18n";
import {
  BookOpen,
  Download,
  FileText,
  FolderOpen,
  Lightbulb,
  Moon,
  Play,
  Save,
  Sparkles,
  Sun,
  Table2,
  Type,
  Code2,
  Wand2,
} from "lucide-react";
import { EditorPanel } from "@/features/editor/EditorPanel";
import { IdeationPanel } from "@/features/ideation/IdeationPanel";
import { MetaPanel } from "@/features/meta/MetaPanel";
import { RefsPanel } from "@/features/refs/RefsPanel";
import { ExportPanel } from "@/features/export/ExportPanel";
import { RightDock } from "@/shell/RightDock";
import { StatusBar } from "@/shell/StatusBar";
import { CommandPalette } from "@/shell/CommandPalette";
import { MdPreviewDialog } from "@/features/md-convert/MdPreviewDialog";

const NAV: { id: AppView; labelKey: "editor" | "ideation" | "meta" | "refs" | "exportNav"; icon: React.ElementType }[] = [
  { id: "editor", labelKey: "editor", icon: FileText },
  { id: "ideation", labelKey: "ideation", icon: Lightbulb },
  { id: "meta", labelKey: "meta", icon: BookOpen },
  { id: "refs", labelKey: "refs", icon: Table2 },
  { id: "export", labelKey: "exportNav", icon: Download },
];

export function Shell() {
  const {
    view,
    setView,
    root,
    dirty,
    status,
    saveProject,
    runCompile,
    exportArchive,
    editorMode,
    setEditorMode,
    activeSection,
    lang,
    setLang,
  } = useApp();
  const [dark, setDark] = React.useState(true);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const L = (k: "save" | "compile" | "export" | "source" | "visual" | "app") => tr(lang, k);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveProject();
      }
      if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        void runCompile();
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setEditorMode(editorMode === "source" ? "visual" : "source");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveProject, runCompile, editorMode, setEditorMode]);

  return (
    <div className="flex h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* toolbar */}
      <header className="flex h-12 items-center gap-2 border-b border-[hsl(var(--border))] px-3">
        <div className="flex items-center gap-2 font-heading text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d4e89] text-xs text-white">
            P
          </span>
          Papex Writer
        </div>
        <div className="mx-2 h-5 w-px bg-[hsl(var(--border))]" />
        <div className="min-w-0 flex-1 truncate text-xs text-[hsl(var(--muted-foreground))]">
          {root ?? (lang === "zh" ? "未打开项目" : "No project")}
          {dirty ? (lang === "zh" ? " · 未保存" : " · unsaved") : ""}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[hsl(var(--muted))] p-0.5">
          <Button
            size="sm"
            variant={editorMode === "source" ? "secondary" : "ghost"}
            className="h-7"
            onClick={() => setEditorMode("source")}
            title="源码模式 (Ctrl+Shift+V)"
          >
            <Code2 className="h-3.5 w-3.5" /> {L("source")}
          </Button>
          <Button
            size="sm"
            variant={editorMode === "visual" ? "secondary" : "ghost"}
            className="h-7"
            onClick={() => setEditorMode("visual")}
            title="所见即所得 (Ctrl+Shift+V)"
          >
            <Type className="h-3.5 w-3.5" /> {L("visual")}
          </Button>
        </div>

        <Button size="sm" variant="outline" onClick={() => void saveProject()}>
          <Save className="h-3.5 w-3.5" /> {L("save")}
        </Button>
        <Button size="sm" variant="cta" onClick={() => void runCompile()}>
          <Play className="h-3.5 w-3.5" /> {L("compile")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => void exportArchive()}>
          <Download className="h-3.5 w-3.5" /> {L("export")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setPaletteOpen(true)} title="命令面板">
          <Wand2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          title="语言 / Language"
          className="text-[11px]"
        >
          {lang === "zh" ? "EN" : "中"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDark((d) => !d)} title="主题">
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* sidebar */}
        <aside className="flex w-[220px] shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <nav className="flex flex-col gap-0.5 p-2">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  view === item.id
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-medium"
                    : "hover:bg-[hsl(var(--muted))]",
                )}
              >
                <item.icon className="h-4 w-4" />
                {tr(lang, item.labelKey)}
              </button>
            ))}
          </nav>
          <div className="mt-auto p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => useApp.getState().setView("welcome")}
            >
              <FolderOpen className="h-3.5 w-3.5" /> {tr(lang, "openProject")}
            </Button>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 overflow-hidden">
          {view === "editor" && <EditorPanel />}
          {view === "ideation" && <IdeationPanel />}
          {view === "meta" && <MetaPanel />}
          {view === "refs" && <RefsPanel />}
          {view === "export" && <ExportPanel />}
        </main>

        {/* right dock */}
        <RightDock />
      </div>

      <StatusBar status={status} section={activeSection} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <MdPreviewDialog />
    </div>
  );
}

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] text-white">
      <Sparkles className="h-3 w-3" /> AI
    </span>
  );
}
