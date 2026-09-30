import { describe, expect, it } from "vitest";
import { countWords } from "./word-count";
import { parseBibLite } from "./bib-parse";

describe("countWords", () => {
  it("counts CJK and latin words", () => {
    // 4 CJK + 1 latin word = 5
    expect(countWords("本文提出 method").words).toBe(5);
    expect(countWords("本文提出新方法").words).toBe(7);
    expect(countWords("hello world").words).toBe(2);
    const s = countWords("本文提出新方法");
    expect(s.chars).toBeGreaterThan(0);
    expect(s.pagesApprox).toBeGreaterThanOrEqual(1);
  });
});

describe("parseBibLite", () => {
  it("parses bib entries", () => {
    const bib = `@article{vaswani2017,
  title = {Attention},
  author = {Vaswani, A.},
  year = {2017}
}`;
    const entries = parseBibLite(bib);
    expect(entries).toHaveLength(1);
    expect(entries[0].key).toBe("vaswani2017");
    expect(entries[0].title).toBe("Attention");
    expect(entries[0].year).toBe(2017);
  });
});
