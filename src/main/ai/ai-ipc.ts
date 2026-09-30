import { ipcMain } from "electron";
import type { AiProviderConfig, AiContext, AiTask } from "@ai-core/index";
import { aiRunTask, getAiAudit } from "../ai/orchestrator";

export function registerAiIpc(): void {
  ipcMain.handle(
    "ai:run",
    async (
      _e,
      payload: { config: AiProviderConfig; task: AiTask; ctx: AiContext },
    ) => {
      try {
        const text = await aiRunTask(payload.config, payload.task, payload.ctx);
        return { ok: true, text };
      } catch (err) {
        return { ok: false, error: (err as Error).message };
      }
    },
  );

  ipcMain.handle("ai:audit", () => getAiAudit());
}
