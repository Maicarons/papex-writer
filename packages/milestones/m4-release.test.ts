import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createDefaultWriterState } from "../shared/src/types";
import { createId } from "../shared/src/id";
import { t, dict } from "../../src/renderer/i18n/index";

/**
 * M4 polish/release exit criteria smoke tests.
 */
describe("M4 polish & release kit", () => {
  it("writer state supports comments, changes, snapshots (review model)", () => {
    const s = createDefaultWriterState();
    expect(s.review.comments).toEqual([]);
    expect(s.review.changes).toEqual([]);
    expect(s.snapshots).toEqual([]);
    expect(s.editor.mode).toBe("source");
    expect(s.editor.ai.enabled).toBe(true);
    expect(s.editor.ai.features.continuation).toBe(false);
  });

  it("ids are unique enough for snapshot/comment keys", () => {
    const a = createId();
    const b = createId();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(6);
  });

  it("electron-builder config targets Win10 NSIS/MSI and multi-platform", () => {
    const yml = readFileSync(join(__dirname, "..", "..", "electron-builder.yml"), "utf-8");
    expect(yml).toContain("nsis");
    expect(yml).toContain("msi");
    expect(yml).toContain("AppImage");
    expect(yml).toContain("dmg");
    expect(yml).toContain("dev.papex.writer");
    expect(yml).toContain("icon.ico");
    // Win10+ is guaranteed by Electron 33; config must not use invalid keys
    expect(yml).not.toContain("minimumSystemVersion");
    expect(yml).toContain("The Papex Authors");
  });

  it("i18n dictionary covers zh/en key labels", () => {
    expect(t("zh", "compile")).toBe("编译");
    expect(t("en", "compile")).toBe("Compile");
    expect(Object.keys(dict.zh)).toEqual(Object.keys(dict.en));
    expect(dict.zh.save).toBeTruthy();
    expect(dict.en.exportNav).toBeTruthy();
  });

  it("snippet / table / review modules are present in the bundle graph", () => {
    const files = [
      "src/renderer/features/editor/SnippetPanel.tsx",
      "src/renderer/features/editor/TableGeneratorDialog.tsx",
      "src/renderer/features/review/ReviewToolbar.tsx",
      "src/renderer/features/ai/AiPanel.tsx",
      "src/main/ai/orchestrator.ts",
    ];
    for (const f of files) {
      const p = join(__dirname, "..", "..", f);
      expect(readFileSync(p, "utf-8").length).toBeGreaterThan(50);
    }
  });
});
