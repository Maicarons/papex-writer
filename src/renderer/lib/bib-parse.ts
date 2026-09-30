export interface BibEntryLite {
  key: string;
  type?: string;
  title?: string;
  author?: string;
  year?: number;
  journal?: string;
}

/** Parse a subset of BibTeX into entries compatible with PapexReference. */
export function parseBibLite(text: string): BibEntryLite[] {
  const out: BibEntryLite[] = [];
  const entryRe = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)\n\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(text))) {
    const type = m[1];
    const key = m[2].trim();
    const body = m[3];
    const field = (name: string) => {
      const fm = body.match(new RegExp(`${name}\\s*=\\s*[{"]([^}"]+)[}"]`, "i"));
      return fm?.[1]?.trim();
    };
    const year = field("year");
    out.push({
      key,
      type: type.toLowerCase(),
      title: field("title"),
      author: field("author"),
      journal: field("journal"),
      year: year ? Number(year) : undefined,
    });
  }
  return out;
}
