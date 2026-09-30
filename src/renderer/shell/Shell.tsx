import * as React from "react";
import { useApp, type AppView } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { t as tr } from "@/i18n";
import { ActivityRail, SidePanel, PanelRow } from "@/shell/chrome";
import { StatusBar } from "@/shell/StatusBar";
import { CommandPalette } from "@/shell/CommandPalette";
import { MdPreviewDialog } from "@/features/md-convert/MdPreviewDialog";
import { EditorPanel } from "@/features/editor/EditorPanel";
import { OutlineList } from "@/features/editor/OutlineList";
import { IdeationPanel } from "@/features/ideation/IdeationPanel";
import { MetaPanel } from "@/features/meta/MetaPanel";
import { RefsPanel } from "@/features/refs/RefsPanel";
import { ExportPanel } from "@/features/export/ExportPanel";
import { EcosystemPanel } from "@/features/ecosystem/EcosystemPanel";
import { PdfPanel } from "@/features/compile/PdfPanel";
import { AiPanel } from "@/features/ai/AiPanel";
import { SearchPanel } from "@/features/search/SearchPanel";
import { GitPanel } from "@/features/git/GitPanel";
import {
  BookOpen,
  Code2,
  Download,
  FileText,
  GitBranch,
  Lightbulb,
  Moon,
  PanelRight,
  Play,
  Save,
  Search as SearchIcon,
  Sparkles,
  Sun,
  Table2,
  Type,
  Wand2,
  Cloud,
  X,
} from "lucide-react";

type MainTab = "editor" | "pdf" | "ai" | "side";

const RAIL: { id: AppView; icon: React.ElementType; labelKey: "editor" | "ideation" | "meta" | "refs" | "exportNav" | "ecosystem" }[] = [
  { id: "editor", icon: FileText, labelKey: "editor" },
  { id: "ideation", icon: Lightbulb, labelKey: "ideation" },
  { id: "meta", icon: BookOpen, labelKey: "meta" },
  { id: "refs", icon: Table2, labelKey: "refs" },
  { id: "export", icon: Download, labelKey: "exportNav" },
  { id: "ecosystem", icon: Cloud, labelKey: "ecosystem" },
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
    manifest,
    setActiveSection,
    writer,
  } = useApp();

  const [dark, setDark] = React.useState(true);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [sideCollapsed, setSideCollapsed] = React.useState(false);
  const [sideWidth, setSideWidth] = React.useState(288);
  const [mainTab, setMainTab] = React.useState<MainTab>("editor");
  const [rightOpen, setRightOpen] = React.useState(true);
  const [sideTab, setSideTab] = React.useState<"pdf" | "ai" | "search" | "git">("pdf");

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
      if (mod && e.key === "e") {
        e.preventDefault();
        void exportArchive();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saveProject, runCompile, exportArchive, editorMode, setEditorMode]);

  const L = (k: "save" | "compile" | "export" | "source" | "visual") => tr(lang, k);

  const sideTitle =
    view === "editor"
      ? lang === "zh"
        ? "章节与大纲"
        : "Outline"
      : view === "ideation"
        ? lang === "zh"
          ? "创意收件箱"
          : "Ideas"
        : view === "refs"
          ? lang === "zh"
            ? "文献库"
            : "References"
          : view === "meta"
            ? lang === "zh"
              ? "项目"
              : "Project"
            : lang === "zh"
              ? "工作区"
              : "Workspace";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* ===== Title bar ===== */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d4e89] text-xs font-bold text-white shadow-sm">
            P
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13px] font-semibold">Papex Writer</span>
            <span className="max-w-[180px] truncate text-[10px] text-[hsl(var(--muted-foreground))]">
              {root ?? (lang === "zh" ? "未打开项目" : "No project")}
              {dirty ? " · •" : ""}
            </span>
          </div>
        </div>

        <div className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />

        {/* mode switch */}
        <div className="flex items-center rounded-lg bg-[hsl(var(--muted))] p-0.5" role="group" aria-label="编辑模式">
          {(
            [
              { m: "source" as const, icon: Code2, label: L("source") },
              { m: "visual" as const, icon: Type, label: L("visual") },
            ]
          ).map(({ m, icon: Icon, label }) => (
            <button
              key={m}
              type="button"
              onClick={() => setEditorMode(m)}
              aria-pressed={editorMode === m}
              className={cn(
                "flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors duration-150",
                editorMode === m
                  ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* primary actions */}
        <Button size="sm" variant="ghost" className="h-8 gap-1.5" onClick={() => void saveProject()}>
          <Save className="h-3.5 w-3.5" aria-hidden /> {L("save")}
        </Button>
        <Button size="sm" variant="cta" className="h-8 gap-1.5 px-3" onClick={() => void runCompile()}>
          <Play className="h-3.5 w-3.5" aria-hidden /> {L("compile")}
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => void exportArchive()}>
          <Download className="h-3.5 w-3.5" aria-hidden /> {L("export")}
        </Button>

        <div className="mx-1 h-5 w-px bg-[hsl(var(--border))]" />

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title={lang === "zh" ? "AI 面板" : "AI"}
          aria-label="AI"
          onClick={() => {
            setRightOpen(true);
            setMainTab("ai");
          }}
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title={lang === "zh" ? "命令面板" : "Command palette"}
          aria-label="Command palette"
          onClick={() => setPaletteOpen(true)}
        >
          <Wand2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title="语言 / Language"
          aria-label="Language"
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
        >
          <span className="text-[11px] font-semibold">{lang === "zh" ? "EN" : "中"}</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title={lang === "zh" ? "主题" : "Theme"}
          aria-label="Theme"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      {/* ===== Body: rail + side + main ===== */}
      <div className="flex min-h-0 flex-1">
        <ActivityRail
          items={RAIL.map((r) => ({
            id: r.id,
            label: tr(lang, r.labelKey),
            icon: r.icon,
            badge: r.id === "ideation" ? writer.ideas.filter((i) => i.status === "inbox").length : undefined,
          }))}
          activeId={view}
          onSelect={(id) => setView(id as AppView)}
        />

        <SidePanel
          title={sideTitle}
          width={sideWidth}
          onWidthChange={setSideWidth}
          collapsed={sideCollapsed}
          onToggleCollapse={() => setSideCollapsed((c) => !c)}
          actions={
            view === "editor" ? (
              <SearchIcon className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" aria-hidden />
            ) : null
          }
        >
          <div className="p-2">
            {view === "editor" && (
              <>
                {manifest.sections.map((s) => (
                  <PanelRow
                    key={s.file}
                    active={activeSection === s.file}
                    title={s.title ?? s.file}
                    meta={s.file}
                    onClick={() => {
                      setActiveSection(s.file);
                      setMainTab("editor");
                    }}
                  />
                ))}
                <div className="mt-3 border-t border-[hsl(var(--border))] pt-2">
                  <OutlineList />
                </div>
              </>
            )}
            {view === "ideation" && (
              <div className="space-y-1">
                {writer.ideas.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    {lang === "zh" ? "暂无灵感" : "No ideas yet"}
                  </p>
                ) : (
                  writer.ideas.slice(0, 30).map((idea) => (
                    <PanelRow
                      key={idea.id}
                      title={idea.title}
                      meta={idea.tags.join(" · ") || idea.status}
                      onClick={() => setView("ideation")}
                    />
                  ))
                )}
              </div>
            )}
            {view === "refs" && (
              <div className="space-y-1">
                {(manifest.references ?? []).map((r) => (
                  <PanelRow key={r.key} title={r.key} meta={r.title?.slice(0, 40)} />
                ))}
                {!(manifest.references ?? []).length && (
                  <p className="px-2 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    {lang === "zh" ? "文献库为空" : "No references"}
                  </p>
                )}
              </div>
            )}
            {(view === "meta" || view === "export" || view === "ecosystem") && (
              <div className="px-2 py-4 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                {view === "meta" &&
                  (lang === "zh"
                    ? "在此编辑 papex.json 元数据。左栏显示项目信息摘要。"
                    : "Edit papex.json metadata. This panel shows project summary.")}
                {view === "export" &&
                  (lang === "zh"
                    ? "导出前预检投稿包完整性。"
                    : "Preflight checks before export.")}
                {view === "ecosystem" &&
                  (lang === "zh"
                    ? "云对接、检索、Git 与插件。"
                    : "Cloud, search, git and plugins.")}
                <div className="mt-3 space-y-1">
                  <PanelRow title={manifest.paper.title} meta="paper.title" />
                  <PanelRow
                    title={String(manifest.authors.length) + (lang === "zh" ? " 位作者" : " authors")}
                    meta="authors"
                  />
                  <PanelRow
                    title={String(manifest.sections.length) + (lang === "zh" ? " 个章节" : " sections")}
                    meta="sections"
                  />
                </div>
              </div>
            )}
          </div>
        </SidePanel>

        {/* Main stage */}
        <main className="flex min-w-0 flex-1 flex-col bg-[hsl(var(--background))]">
          {/* stage tabs */}
          <div className="flex h-10 shrink-0 items-center gap-1 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2">
            {(
              [
                { id: "editor" as MainTab, label: lang === "zh" ? "编辑器" : "Editor", icon: FileText },
                { id: "pdf" as MainTab, label: "PDF", icon: Play },
                { id: "ai" as MainTab, label: "AI", icon: Sparkles },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMainTab(tab.id);
                  setRightOpen(true);
                }}
                aria-pressed={mainTab === tab.id}
                className={cn(
                  "flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs transition-colors duration-150",
                  mainTab === tab.id
                    ? "bg-[hsl(var(--accent))] font-medium text-[hsl(var(--accent-foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                )}
              >
                <tab.icon className="h-3.5 w-3.5" aria-hidden />
                {tab.label}
              </button>
            ))}
            <div className="flex-1" />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              aria-label={rightOpen ? "隐藏右栏" : "显示右栏"}
              title={rightOpen ? "隐藏右栏" : "显示右栏"}
              onClick={() => setRightOpen((v) => !v)}
            >
              <PanelRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* content */}
            <div className="min-w-0 flex-1 overflow-hidden">
              {view === "editor" && mainTab === "editor" && <EditorPanel />}
              {view === "editor" && mainTab === "pdf" && (
                <div className="h-full overflow-auto p-4">
                  <PdfPanel />
                </div>
              )}
              {view === "editor" && mainTab === "ai" && (
                <div className="h-full overflow-auto p-4">
                  <AiPanel />
                </div>
              )}
              {view === "ideation" && <IdeationPanel />}
              {view === "meta" && <MetaPanel />}
              {view === "refs" && <RefsPanel />}
              {view === "export" && <ExportPanel />}
              {view === "ecosystem" && <EcosystemPanel />}
            </div>

            {/* right dock — editor-centric, Overleaf PDF/review style */}
            {rightOpen && view === "editor" && (
              <aside className="flex w-[300px] shrink-0 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <header className="flex h-10 shrink-0 items-center justify-between border-b border-[hsl(var(--border))] px-3">
                  <div className="flex gap-1">
                    {(
                      [
                        { id: "pdf" as const, label: "PDF" },
                        { id: "ai" as const, label: "AI" },
                        { id: "search" as const, label: lang === "zh" ? "检索" : "Search" },
                        { id: "git" as const, label: "Git" },
                      ]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setSideTab(tab.id);
                          if (tab.id === "pdf" || tab.id === "ai") setMainTab(tab.id);
                          else setMainTab("side");
                        }}
                        className={cn(
                          "cursor-pointer rounded-md px-2 py-1 text-[11px] transition-colors",
                          sideTab === tab.id
                            ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]",
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="关闭右栏"
                    onClick={() => setRightOpen(false)}
                    className="cursor-pointer rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </header>
                <div className="min-h-0 flex-1 overflow-auto p-3">
                  {sideTab === "pdf" && <PdfPanel />}
                  {sideTab === "ai" && <AiPanel />}
                  {sideTab === "search" && <SearchPanel />}
                  {sideTab === "git" && <GitPanel />}
                </div>
              </aside>
            )}
          </div>
        </main>
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
      <Sparkles className="h-3 w-3" aria-hidden /> AI
    </span>
  );
}

export { GitBranch };
