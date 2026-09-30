/**
 * Pluggable AI core: providers (OpenAI-compatible / Anthropic / Ollama / custom),
 * prompt templates, context builders, streaming. Pure TS — no Electron deps.
 */

export type AiProviderKind = "openai-compatible" | "anthropic" | "ollama" | "custom";

export interface AiProviderConfig {
  kind: AiProviderKind;
  baseUrl: string;
  apiKey?: string;
  model: string;
  timeoutMs?: number;
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiRequest {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AiChunk {
  type: "delta" | "done" | "error";
  text?: string;
  error?: string;
}

export interface AiProvider {
  kind: AiProviderKind;
  stream(req: AiRequest): AsyncIterable<AiChunk>;
  complete(req: AiRequest): Promise<string>;
}

export function createProvider(config: AiProviderConfig): AiProvider {
  switch (config.kind) {
    case "ollama":
      return createOllamaProvider(config);
    case "anthropic":
      return createAnthropicProvider(config);
    case "openai-compatible":
    case "custom":
    default:
      return createOpenAiProvider(config);
  }
}

async function* streamSse(
  res: Response,
  extract: (data: string) => string | null,
): AsyncIterable<AiChunk> {
  if (!res.ok || !res.body) {
    yield { type: "error", error: `AI request failed: ${res.status} ${res.statusText}` };
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n");
      buf = parts.pop() ?? "";
      for (const line of parts) {
        const t = line.replace(/^data:\s*/, "").trim();
        if (!t || t === "[DONE]") continue;
        try {
          const delta = extract(t);
          if (delta) yield { type: "delta", text: delta };
        } catch {
          /* ignore malformed chunk */
        }
      }
    }
    yield { type: "done" };
  } catch (e) {
    yield { type: "error", error: (e as Error).message };
  }
}

function createOpenAiProvider(config: AiProviderConfig): AiProvider {
  const url = config.baseUrl.replace(/\/$/, "") + "/chat/completions";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  return {
    kind: config.kind,
    async *stream(req: AiRequest) {
      const res = await fetch(url, {
        method: "POST",
        headers,
        signal: req.signal,
        body: JSON.stringify({
          model: config.model,
          messages: req.messages,
          temperature: req.temperature ?? 0.4,
          max_tokens: req.maxTokens ?? 2048,
          stream: true,
        }),
      });
      yield* streamSse(res, (data) => {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        return json.choices?.[0]?.delta?.content ?? null;
      });
    },
    async complete(req: AiRequest) {
      let out = "";
      for await (const c of this.stream(req)) {
        if (c.type === "delta" && c.text) out += c.text;
        if (c.type === "error") throw new Error(c.error);
      }
      return out;
    },
  };
}

function createAnthropicProvider(config: AiProviderConfig): AiProvider {
  const url = config.baseUrl.replace(/\/$/, "") + "/messages";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
  };
  if (config.apiKey) headers["x-api-key"] = config.apiKey;

  return {
    kind: config.kind,
    async *stream(req: AiRequest) {
      const system = req.messages.find((m) => m.role === "system")?.content ?? "";
      const messages = req.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(url, {
        method: "POST",
        headers,
        signal: req.signal,
        body: JSON.stringify({
          model: config.model,
          system,
          messages,
          max_tokens: req.maxTokens ?? 2048,
          stream: true,
        }),
      });
      yield* streamSse(res, (data) => {
        const json = JSON.parse(data) as {
          type?: string;
          delta?: { text?: string };
        };
        return json.delta?.text ?? null;
      });
    },
    async complete(req: AiRequest) {
      let out = "";
      for await (const c of this.stream(req)) {
        if (c.type === "delta" && c.text) out += c.text;
        if (c.type === "error") throw new Error(c.error);
      }
      return out;
    },
  };
}

function createOllamaProvider(config: AiProviderConfig): AiProvider {
  const url = config.baseUrl.replace(/\/$/, "") + "/api/chat";
  return {
    kind: "ollama",
    async *stream(req: AiRequest) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: req.signal,
        body: JSON.stringify({
          model: config.model,
          messages: req.messages,
          stream: true,
        }),
      });
      yield* streamSse(res, (data) => {
        const json = JSON.parse(data) as { message?: { content?: string } };
        return json.message?.content ?? null;
      });
    },
    async complete(req: AiRequest) {
      let out = "";
      for await (const c of this.stream(req)) {
        if (c.type === "delta" && c.text) out += c.text;
        if (c.type === "error") throw new Error(c.error);
      }
      return out;
    },
  };
}

/** Feature flags — every AI capability can be disabled. */
export interface AiFeatureFlags {
  ideation: boolean;
  outline: boolean;
  mdEnhance: boolean;
  polish: boolean;
  continuation: boolean;
  latex: boolean;
  errorExplain: boolean;
  citation: boolean;
  abstract: boolean;
  review: boolean;
  exportCheck: boolean;
}

export const DEFAULT_AI_FEATURES: AiFeatureFlags = {
  ideation: true,
  outline: true,
  mdEnhance: true,
  polish: true,
  continuation: false,
  latex: true,
  errorExplain: true,
  citation: false,
  abstract: true,
  review: true,
  exportCheck: true,
};

export type AiTask =
  | "ideation"
  | "outline"
  | "mdEnhance"
  | "polish"
  | "expand"
  | "shrink"
  | "academicize"
  | "translate"
  | "latexTable"
  | "latexEquation"
  | "errorExplain"
  | "abstract"
  | "review"
  | "exportCheck";

export interface AiContext {
  selection?: string;
  sectionText?: string;
  title?: string;
  abstract?: string;
  outline?: string;
  compileLog?: string;
  language?: "zh" | "en";
}

const PROMPTS: Record<AiTask, (ctx: AiContext) => AiMessage[]> = {
  ideation: (ctx) => [
    {
      role: "system",
      content: "你是学术写作助手。根据素材提炼研究问题、贡献点与关键词。只输出要点列表，不要编造引用。",
    },
    { role: "user", content: `素材：\n${ctx.selection ?? ctx.sectionText ?? ""}` },
  ],
  outline: (ctx) => [
    {
      role: "system",
      content: "你是论文结构顾问。输出中英文学术论文的章节大纲（section/subsection），简洁可执行。",
    },
    {
      role: "user",
      content: `标题：${ctx.title ?? ""}\n摘要：${ctx.abstract ?? ""}\n已有大纲：${ctx.outline ?? ""}`,
    },
  ],
  mdEnhance: (ctx) => [
    {
      role: "system",
      content:
        "将笔记/口语化文本改写为学术论文段落。保留原意与结构，不要编造引用或数据。只输出正文段落。",
    },
    { role: "user", content: ctx.selection ?? "" },
  ],
  polish: (ctx) => [
    {
      role: "system",
      content: "润色学术文本：语法、用词、连贯性。保留 \\cite{} 与数学表达式。只输出修改后文本。",
    },
    { role: "user", content: ctx.selection ?? "" },
  ],
  expand: (ctx) => [
    { role: "system", content: "扩写学术段落，增加论证与细节，保持学术语气。只输出文本。" },
    { role: "user", content: ctx.selection ?? "" },
  ],
  shrink: (ctx) => [
    { role: "system", content: "压缩学术段落，保留关键信息。只输出文本。" },
    { role: "user", content: ctx.selection ?? "" },
  ],
  academicize: (ctx) => [
    { role: "system", content: "将文本提升为正式学术书面语。只输出文本。" },
    { role: "user", content: ctx.selection ?? "" },
  ],
  translate: (ctx) => [
    {
      role: "system",
      content: "在中英之间翻译学术文本。保留 \\cite{}、公式与专有名词。只输出译文。",
    },
    { role: "user", content: ctx.selection ?? "" },
  ],
  latexTable: (ctx) => [
    {
      role: "system",
      content: "根据描述生成 booktabs 三线表 LaTeX 代码。只输出可编译的 LaTeX。",
    },
    { role: "user", content: ctx.selection ?? "" },
  ],
  latexEquation: (ctx) => [
    { role: "system", content: "根据描述生成 LaTeX 公式。只输出公式代码。" },
    { role: "user", content: ctx.selection ?? "" },
  ],
  errorExplain: (ctx) => [
    {
      role: "system",
      content: "解释 LaTeX 编译错误并给出修复建议。用简洁中文，按「原因 / 修复」结构输出。",
    },
    { role: "user", content: ctx.compileLog ?? "" },
  ],
  abstract: (ctx) => [
    {
      role: "system",
      content: "根据全文或大纲生成/润色摘要与关键词。只输出摘要段落与关键词行。",
    },
    {
      role: "user",
      content: `标题：${ctx.title ?? ""}\n正文/大纲：\n${ctx.sectionText ?? ctx.outline ?? ""}`,
    },
  ],
  review: (ctx) => [
    {
      role: "system",
      content: "审阅学术草稿：一致性、术语、图表引用、摘要与结论对齐。输出问题清单，不改写原文。",
    },
    { role: "user", content: ctx.sectionText ?? "" },
  ],
  exportCheck: (ctx) => [
    {
      role: "system",
      content: "检查投稿包完整性：缺图、缺引用、语言提示。输出检查清单。",
    },
    { role: "user", content: ctx.sectionText ?? "" },
  ],
};

export function buildPrompt(task: AiTask, ctx: AiContext): AiMessage[] {
  return PROMPTS[task](ctx);
}

export async function runAiTask(
  provider: AiProvider,
  task: AiTask,
  ctx: AiContext,
  opts?: { signal?: AbortSignal; onDelta?: (t: string) => void },
): Promise<string> {
  const messages = buildPrompt(task, ctx);
  let out = "";
  for await (const chunk of provider.stream({
    messages,
    signal: opts?.signal,
  })) {
    if (chunk.type === "delta" && chunk.text) {
      out += chunk.text;
      opts?.onDelta?.(chunk.text);
    }
    if (chunk.type === "error") throw new Error(chunk.error ?? "AI error");
  }
  return out;
}
