import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Plus, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { markdownToLatex } from "@md-to-latex/index";

export function IdeationPanel() {
  const { writer, addIdea, updateIdea, removeIdea, openMdPreview, setView, setAiOutput, setAiRunning, manifest } =
    useApp();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [tags, setTags] = React.useState("");

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">创意收件箱</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              捕获灵感 · 打标签 · 升格为章节草稿
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAiRunning(true);
              setAiOutput(
                "研究问题建议（离线占位）：\n1. 双模编辑如何保证源码一致性？\n2. Markdown 转写的保真度如何评估？\n\n配置 AI 端点后将由模型生成。",
              );
              setAiRunning(false);
              setView("editor");
              useApp.getState().setRightTab("ai");
            }}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI 提炼
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">记一条灵感</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              placeholder="内容…（可粘贴 Markdown）"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Input
              placeholder="标签，逗号分隔：method, todo"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!title.trim()) return;
                addIdea(
                  title.trim(),
                  body.trim(),
                  tags
                    .split(/[,,]/)
                    .map((t) => t.trim())
                    .filter(Boolean),
                );
                setTitle("");
                setBody("");
                setTags("");
              }}
            >
              <Plus className="h-3.5 w-3.5" /> 保存灵感
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {writer.ideas.map((idea) => (
            <Card key={idea.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{idea.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      title="转为章节草稿"
                      onClick={() => {
                        const r = markdownToLatex(`## ${idea.title}\n\n${idea.body}`);
                        openMdPreview(r.latex, manifest.sections[0]?.file ?? "");
                        setView("editor");
                      }}
                    >
                      <ArrowRight className="h-3 w-3" /> 转章节
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[hsl(var(--destructive))]"
                      onClick={() => removeIdea(idea.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {idea.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                  <Badge variant={idea.status === "inbox" ? "default" : "outline"}>{idea.status}</Badge>
                </div>
              </CardHeader>
              {idea.body && (
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-[hsl(var(--muted-foreground))]">
                    {idea.body}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => updateIdea(idea.id, { status: "linked" })}
                    >
                      标记已采用
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => updateIdea(idea.id, { status: "archived" })}
                    >
                      归档
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          {!writer.ideas.length && (
            <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              还没有灵感。在上方记录第一条想法。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
