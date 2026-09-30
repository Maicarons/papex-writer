import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Lightbulb, Sparkles, Type } from "lucide-react";
import { markdownToLatex } from "@md-to-latex/index";

export function WelcomePage() {
  const { recents, createProject, openProject, status } = useApp();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1d4e89] text-[10px] text-white">
              P
            </span>
            Papex 生态 · papex-latex 契约
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight">Papex Writer</h1>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            本地优先的论文创意与编辑工作台 — 源码 / 所见即所得双模 · Markdown 转写 · AI 全流程 · 一键导出 Papex 投稿包
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> 新建论文项目
              </CardTitle>
              <CardDescription>使用 papex-latex 模板创建本地项目目录</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => void createProject()}>
                选择目录并创建
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> 打开已有项目
              </CardTitle>
              <CardDescription>打开包含 papex.json 的目录</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => void openProject()}>
                打开文件夹
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Feature icon={Type} title="双模编辑" desc="源码与所见即所得共享同一文档" />
          <Feature icon={Sparkles} title="AI 辅助" desc="大纲 / 润色 / 报错解释可开关" />
          <Feature icon={Lightbulb} title="创意库" desc="灵感收件箱并升格为章节" />
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>最近项目</CardTitle>
            <CardDescription>{status}</CardDescription>
          </CardHeader>
          <CardContent>
            {recents.length === 0 ? (
              <div className="text-sm text-[hsl(var(--muted-foreground))]">暂无最近项目</div>
            ) : (
              <ul className="space-y-1">
                {recents.map((r) => (
                  <li key={r}>
                    <button
                      className="w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-[hsl(var(--accent))]"
                      onClick={() => void openProject(r)}
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>快速试用：Markdown 转论文片段</CardTitle>
            <CardDescription>粘贴 Markdown，预览转换结果（无需打开项目）</CardDescription>
          </CardHeader>
          <CardContent>
            <MdDemo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-[hsl(var(--primary))]" /> {title}
        </CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function MdDemo() {
  const [md, setMd] = React.useState("# 方法\n\n本文提出**双模编辑**框架。\n\n- 规则转写\n- AI 增强\n\n$$E=mc^2$$");
  const openMdPreview = useApp((s) => s.openMdPreview);
  const setView = useApp((s) => s.setView);

  return (
    <div className="space-y-2">
      <textarea
        value={md}
        onChange={(e) => setMd(e.target.value)}
        className="h-32 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-3 text-sm font-mono"
      />
      <Button
        size="sm"
        onClick={() => {
          const r = markdownToLatex(md);
          openMdPreview(r.latex, "sections/00-intro.tex");
          setView("editor");
        }}
      >
        转写为论文片段
      </Button>
    </div>
  );
}
