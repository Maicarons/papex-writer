import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { markdownToLatex } from "@md-to-latex/index";
import {
  FolderOpen,
  FilePlus2,
  Sparkles,
  Type,
  Code2,
  Moon,
  Sun,
} from "lucide-react";

export function WelcomePage() {
  const { recents, createProject, openProject, createFromTemplate, status, lang, setLang } = useApp();
  const [dark, setDark] = React.useState(true);
  const zh = lang === "zh";

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-8 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d4e89] text-sm font-bold text-white shadow-md shadow-[#1d4e89]/25">
            P
          </div>
          <div>
            <div className="font-heading text-[15px] font-semibold leading-tight">Papex Writer</div>
            <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {zh ? "本地优先 · 学术写作工作台" : "Local-first academic writing studio"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Language"
            onClick={() => setLang(zh ? "en" : "zh")}
          >
            <span className="text-[11px] font-semibold">{zh ? "EN" : "中"}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="Theme"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 pb-16 pt-12">
        <section className="mb-12">
          <h1 className="font-heading text-[40px] font-bold leading-[1.15] tracking-tight">
            {zh ? "从灵感到投稿包，" : "From idea to submission"}
            <br />
            <span className="text-[hsl(var(--primary))]">
              {zh ? "一个工作台完成。" : "in one studio."}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {zh
              ? "源码与所见即所得双模编辑、Markdown 转论文片段、全流程 AI 辅助，并以 papex-latex 契约一键导出 submission.tar.gz。"
              : "Dual-mode source/visual editing, Markdown-to-paper conversion, full-flow AI assistance, and papex-latex submission export."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              className="h-11 gap-2 px-5 text-sm"
              onClick={() => void createFromTemplate("sample")}
            >
              <FilePlus2 className="h-4 w-4" aria-hidden />
              {zh ? "创建示例项目" : "New sample project"}
            </Button>
            <Button
              variant="outline"
              className="h-11 gap-2 px-5 text-sm"
              onClick={() => void createProject()}
            >
              <FolderOpen className="h-4 w-4" aria-hidden />
              {zh ? "新建空白项目" : "New blank project"}
            </Button>
            <Button
              variant="ghost"
              className="h-11 gap-2 px-5 text-sm"
              onClick={() => void openProject()}
            >
              {zh ? "打开已有项目…" : "Open project…"}
            </Button>
          </div>
        </section>

        <section className="mb-12 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Code2,
              title: zh ? "双模编辑" : "Dual editor",
              body: zh
                ? "CodeMirror 源码 + Visual 投影，同一文档真相"
                : "CodeMirror source + visual projection, one source of truth",
            },
            {
              icon: Sparkles,
              title: zh ? "AI 全流程" : "AI workflow",
              body: zh
                ? "大纲、润色、报错解释，可插拔可关闭"
                : "Outline, polish, error explain — pluggable and toggleable",
            },
            {
              icon: Type,
              title: zh ? "Markdown 转写" : "MD convert",
              body: zh
                ? "笔记与素材一键转为论文级 LaTeX 片段"
                : "Turn notes into paper-ready LaTeX fragments",
            },
          ].map((f) => (
            <article
              key={f.title}
              className="cursor-default rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-shadow duration-200 hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]">
                <f.icon className="h-4 w-4" aria-hidden />
              </div>
              <h2 className="font-heading text-[15px] font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[hsl(var(--muted-foreground))]">
                {f.body}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <header className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3.5">
            <h2 className="text-[13px] font-semibold">
              {zh ? "最近项目" : "Recent projects"}
            </h2>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{status}</span>
          </header>
          {recents.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-[hsl(var(--muted-foreground))]">
              {zh
                ? "还没有最近项目。从上方创建示例项目开始体验。"
                : "No recent projects yet. Create a sample project above."}
            </div>
          ) : (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {recents.map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => void openProject(r)}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    <FolderOpen className="h-4 w-4 text-[hsl(var(--muted-foreground))]" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{r}</span>
                    <span className="text-[11px] text-[hsl(var(--primary))]">
                      {zh ? "打开" : "Open"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-[13px] font-semibold text-[hsl(var(--muted-foreground))]">
            {zh ? "快速试用：Markdown → 论文片段" : "Try: Markdown → paper fragment"}
          </h2>
          <MdDemo zh={zh} />
        </section>
      </main>
    </div>
  );
}

function MdDemo({ zh }: { zh: boolean }) {
  const [md, setMd] = React.useState(
    zh
      ? "# 方法\n\n本文提出**双模编辑**框架。\n\n- 规则转写\n- AI 增强\n\n$$E=mc^2$$"
      : "# Method\n\nWe propose a **dual-mode** editor.\n\n- Rules first\n- AI enhance\n\n$$E=mc^2$$",
  );
  const openMdPreview = useApp((s) => s.openMdPreview);
  const setView = useApp((s) => s.setView);

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <textarea
        value={md}
        onChange={(e) => setMd(e.target.value)}
        aria-label="Markdown"
        className="h-28 w-full resize-none rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 font-mono text-[12px] leading-5 outline-none transition-shadow focus:ring-2 focus:ring-[hsl(var(--ring))]"
      />
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => {
            const r = markdownToLatex(md);
            openMdPreview(r.latex, "sections/00-intro.tex");
            setView("editor");
          }}
        >
          {zh ? "转写为论文片段" : "Convert to LaTeX"}
        </Button>
      </div>
    </div>
  );
}
