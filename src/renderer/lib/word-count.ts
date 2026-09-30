/** Word / character counts for academic writing. */
export interface WordStats {
  words: number;
  chars: number;
  charsNoSpace: number;
  lines: number;
  /** Rough page estimate at ~500 words/page (English) or ~800 chars/page (Chinese mixed). */
  pagesApprox: number;
}

export function countWords(text: string): WordStats {
  const lines = text.split("\n");
  // CJK chars count as 1 word each; latin words split by whitespace
  const cjk = text.match(/[一-鿿鿿㐀-䶿]/g)?.length ?? 0;
  const latin = text
    .replace(/[一-鿿㐀-䶿]/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  const words = cjk + latin;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const pagesApprox = Math.max(1, Math.ceil(charsNoSpace / 800));
  return { words, chars, charsNoSpace, lines: lines.length, pagesApprox };
}
