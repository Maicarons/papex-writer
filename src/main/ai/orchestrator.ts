/**
 * Main-process AI orchestrator (plan §5): provider proxy, audit log, streaming.
 * Renderer may also call providers directly for local Ollama; this module is
 * the audited path used when settings route AI through main.
 */
import type { AiProviderConfig, AiMessage } from "@ai-core/index";
import { createProvider, runAiTask, type AiContext, type AiTask } from "@ai-core/index";

export interface AiAuditEntry {
  ts: string;
  task: string;
  provider: string;
  model: string;
  ok: boolean;
  charsIn: number;
  charsOut: number;
  error?: string;
}

const auditLog: AiAuditEntry[] = [];

export function getAiAudit(): AiAuditEntry[] {
  return [...auditLog];
}

export async function aiRunTask(
  config: AiProviderConfig,
  task: AiTask,
  ctx: AiContext,
  opts?: { signal?: AbortSignal; onDelta?: (t: string) => void },
): Promise<string> {
  const provider = createProvider(config);
  const charsIn = JSON.stringify(ctx).length;
  try {
    const out = await runAiTask(provider, task, ctx, opts);
    auditLog.push({
      ts: new Date().toISOString(),
      task,
      provider: config.kind,
      model: config.model,
      ok: true,
      charsIn,
      charsOut: out.length,
    });
    return out;
  } catch (e) {
    auditLog.push({
      ts: new Date().toISOString(),
      task,
      provider: config.kind,
      model: config.model,
      ok: false,
      charsIn,
      charsOut: 0,
      error: (e as Error).message,
    });
    throw e;
  }
}

export async function aiChat(
  config: AiProviderConfig,
  messages: AiMessage[],
): Promise<string> {
  const provider = createProvider(config);
  return provider.complete({ messages });
}
