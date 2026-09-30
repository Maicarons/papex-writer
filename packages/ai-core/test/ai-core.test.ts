import { describe, expect, it } from "vitest";
import { DEFAULT_AI_FEATURES, buildPrompt, createProvider } from "../src/index";

describe("ai-core", () => {
  it("builds polish prompt from selection", () => {
    const msgs = buildPrompt("polish", { selection: "本文提出方法。" });
    expect(msgs[0].role).toBe("system");
    expect(msgs[1].content).toContain("本文提出方法。");
  });

  it("builds error explain prompt from log", () => {
    const msgs = buildPrompt("errorExplain", { compileLog: "Undefined control sequence" });
    expect(msgs[1].content).toContain("Undefined control sequence");
  });

  it("has default feature flags with continuation off", () => {
    expect(DEFAULT_AI_FEATURES.continuation).toBe(false);
    expect(DEFAULT_AI_FEATURES.polish).toBe(true);
  });

  it("creates providers by kind", () => {
    expect(createProvider({ kind: "ollama", baseUrl: "http://127.0.0.1:11434", model: "llama3" }).kind).toBe("ollama");
    expect(
      createProvider({ kind: "openai-compatible", baseUrl: "https://api.example.com/v1", model: "gpt" }).kind,
    ).toBe("openai-compatible");
    expect(
      createProvider({ kind: "anthropic", baseUrl: "https://api.anthropic.com", model: "claude" }).kind,
    ).toBe("anthropic");
  });
});
