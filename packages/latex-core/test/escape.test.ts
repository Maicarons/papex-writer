import { describe, expect, it } from "vitest";
import { bibtexEscape, latexEscape } from "../src/escape";

describe("latexEscape", () => {
  it("escapes special characters in a single pass", () => {
    expect(latexEscape("100% & $x_1$")).toBe(
      "100\\% \\& \\$x\\_1\\$",
    );
  });

  it("does not re-escape replacement text", () => {
    expect(latexEscape("\\")).toBe("\\textbackslash{}");
    expect(latexEscape("\\&")).toBe("\\textbackslash{}\\&");
  });

  it("handles null/undefined", () => {
    expect(latexEscape(null)).toBe("");
    expect(latexEscape(undefined)).toBe("");
  });
});

describe("bibtexEscape", () => {
  it("escapes braces and specials once", () => {
    expect(bibtexEscape("{Title} & 100%")).toBe(
      "\\{Title\\} \\& 100\\%",
    );
  });
});
