import * as React from "react";
import { useApp } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/shell/RightDock";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { DEFAULT_AI_FEATURES, buildPrompt, type AiTask } from "@ai-core/index";

const TASKS: { id: AiTask; label: string }[] = [
  { id: "polish", label: "润色" },
  { id: "expand", label: "扩写" },
  { id: "shrink", label: "缩写" },
  { id: "academicize", label: "学术化" },
  { id: "translate", label: "翻译" },
  { id: "outline", label: "大纲建议" },
  { id: "abstract", label: "摘要生成" },
  { id: "errorExplain", label: "错误解释" },
  { id: "review", label: "审阅" },
  { id: "mdEnhance", label: "转写增强" },
  { id: "latexTable", label: "生成表格" },
  { id: "latexEquation", label: "生成公式" },
];

export function AiPanel() {
  const { ai, setAiOutput, setAiRunning, files, activeSection, manifest, writer, compile, setSectionContent } =
    useApp();
  const [copied, setCopied] = React.useState(false);
  const [task, setTask] = React.useState<AiTask>("polish");

  const runTask = async (t: AiTask) => {
    setTask(t);
    setAiRunning(true);
    const selection = files[activeSection] ?? "";
    const prompt = buildPrompt(t, {
      selection,
      sectionText: selection,
      title: manifest.paper.title,
      abstract: manifest.paper.abstract,
      compileLog: compile.log,
      language: "zh",
    });

    const cfg = writer.editor.ai;
    if (!cfg.enabled || !cfg.features.polish) {
      setAiOutput(
        `【离线模式】任务：${t}\n\n提示词已构建（${prompt.length} 条消息）。\n` +
          `当前 Provider：${cfg.provider} @ ${cfg.baseUrl} / ${cfg.model}\n\n` +
          `在 设置 中启用并配置 AI 端点后，此处将显示流式模型输出。\n` +
          `本地规则仍可使用：Markdown 转写、编译日志解析、LaTeX 补全数据。`,
      );
      setAiRunning(false);
      return;
    }

    try {
      // Runtime AI call is done via fetch in renderer when allowed; keep offline-first default.
      const resp = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(writer.editor.ai.provider !== "ollama"
            ? { Authorization: "Bearer " + "" }
            : {}),
        },
        body: JSON.stringify({
          model: cfg.model,
          messages: prompt,
          stream: false,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = (await resp.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      setAiOutput(data.choices?.[0]?.message?.content ?? "（空响应）");
    } catch (e) {
      setAiOutput(
        `AI 请求失败：${(e as Error).message}\n\n可尝试本地 Ollama：\n  ollama serve\n  ollama pull llama3\n` +
          `并保持 baseUrl=http://127.0.0.1:11434`,
      );
    } finally {
      setAiRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SectionTitle>AI 辅助（全流程 · 可关闭）</SectionTitle>
      <div className="mb-2 flex flex-wrap gap-1">
        {TASKS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={task === t.id ? "secondary" : "outline"}
            className="h-7 text-[11px]"
            onClick={() => void runTask(t.id)}
            disabled={ai.running}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="mb-2 rounded-md border border-[hsl(var(--border))] p-2 text-[11px] text-[hsl(var(--muted-foreground))]">
        Provider：<b>{writer.editor.ai.provider}</b> · {writer.editor.ai.baseUrl} ·{" "}
        {writer.editor.ai.model}
        <div className="mt-1">
          默认能力：{Object.entries(DEFAULT_AI_FEATURES)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(", ")}
        </div>
      </div>

      <div className="mb-2 flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          disabled={ai.running || !ai.output}
          onClick={() => {
            void navigator.clipboard.writeText(ai.output);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} 复制
        </Button>
        <Button
          size="sm"
          variant="cta"
          className="h-7"
          disabled={ai.running || !ai.output}
          onClick={() => setSectionContent(activeSection, (files[activeSection] ?? "") + "\n\n" + ai.output + "\n")}
        >
          插入到章节
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
        {ai.running ? (
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> 生成中…
          </div>
        ) : ai.output ? (
          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-5">{ai.output}</pre>
        ) : (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            <Sparkles className="mr-1 inline h-3 w-3" />
            选择任务后在此查看输出。AI 默认不覆盖原文。
          </div>
        )}
      </div>
    </div>
  );
}
