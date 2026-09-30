import { describe, expect, it, beforeEach } from "vitest";
import {
  installBuiltinPlugin,
  clearPlugins,
  listPlugins,
  collectSnippets,
  collectExporters,
  collectPrompts,
} from "../shared/src/plugins";
import { search, filesToDocs } from "../shared/src/search";
import { healthCheck } from "../shared/src/papex-cloud";

describe("M5 ecosystem", () => {
  beforeEach(() => {
    clearPlugins();
  });

  it("plugin registry installs builtin pack", () => {
    expect(listPlugins()).toHaveLength(0);
    installBuiltinPlugin();
    expect(listPlugins()).toHaveLength(1);
    expect(collectSnippets().length).toBeGreaterThan(0);
    expect(collectExporters().length).toBeGreaterThan(0);
    expect(collectPrompts("ideation").length).toBeGreaterThan(0);
    const exporter = collectExporters()[0];
    const out = exporter.render([
      { name: "papex.json", content: "{}" },
      { name: "sections/a.tex", content: "x" },
    ]);
    expect(out).toContain("papex.json");
    expect(exporter.extension).toBe(".txt");
  });

  it("full-text search ranks section hits with line numbers", () => {
    const docs = filesToDocs(
      {
        "sections/00-intro.tex": "双模编辑器设计\n\n源码与视觉模式共享文档。",
        "sections/01-method.tex": "Markdown 转写\n\n规则引擎优先。",
      },
      { "sections/00-intro.tex": "引言", "sections/01-method.tex": "方法" },
    );
    const hits = search(docs, "双模");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].path).toBe("sections/00-intro.tex");
    expect(hits[0].line).toBeGreaterThanOrEqual(1);
    expect(hits[0].score).toBeGreaterThan(0);
    expect(search(docs, "zzzz-not-found")).toHaveLength(0);
  });

  it("cloud client is optional and safe when disabled", async () => {
    const ok = await healthCheck({ baseUrl: "http://127.0.0.1:9", apiKey: "", enabled: false });
    expect(ok).toBe(false);
  });
});
