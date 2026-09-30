/**
 * Project full-text search (M5, MiniSearch-lite).
 * Pure TS scoring — no dependency required for core search.
 */

export interface SearchDoc {
  id: string;
  title: string;
  body: string;
  path: string;
}

export interface SearchHit {
  id: string;
  path: string;
  title: string;
  snippet: string;
  score: number;
  line: number;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
}

export function buildIndex(docs: SearchDoc[]): SearchDoc[] {
  return docs;
}

export function search(docs: SearchDoc[], query: string, limit = 20): SearchHit[] {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  const hits: SearchHit[] = [];

  for (const doc of docs) {
    const titleTokens = tokenize(doc.title);
    const bodyLower = doc.body.toLowerCase();
    let score = 0;
    let firstLine = 1;
    const lines = doc.body.split("\n");
    for (const line of lines) {
      const lTokens = tokenize(line);
      const text = line.toLowerCase();
      let lineScore = 0;
      for (const q of qTokens) {
        if (titleTokens.includes(q)) lineScore += 5;
        if (text.includes(q)) lineScore += 2;
        if (lTokens.includes(q)) lineScore += 3;
      }
      if (lineScore > 0 && score === 0) firstLine = lines.indexOf(line) + 1;
      score += lineScore;
    }
    if (score > 0) {
      const idx = bodyLower.indexOf(qTokens[0]);
      const start = Math.max(0, idx - 40);
      hits.push({
        id: doc.id,
        path: doc.path,
        title: doc.title,
        snippet: doc.body.slice(start, start + 120).replace(/\s+/g, " "),
        score,
        line: firstLine,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

export function filesToDocs(files: Record<string, string>, titles: Record<string, string>): SearchDoc[] {
  return Object.entries(files).map(([path, body]) => ({
    id: path,
    path,
    title: titles[path] ?? path,
    body,
  }));
}
