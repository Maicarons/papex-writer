import type { ArchiveFile, PapexManifest } from "./types";

/**
 * Create a deterministic "tar-like" bundle representation.
 * For browser/main export we produce a simple uncompressed archive format
 * that can be wrapped as tar.gz by the caller, or saved as .papex-archive.json
 * for local round-trips. The tar writer lives in main process (Node).
 */
export function serializeArchive(files: ArchiveFile[]): string {
  return JSON.stringify(
    {
      format: "papex-archive/v1",
      files: files.map((f) => ({ name: f.name, content: f.content })),
    },
    null,
    2,
  );
}

export function deserializeArchive(raw: string): ArchiveFile[] {
  const data = JSON.parse(raw) as { files?: ArchiveFile[] };
  return data.files ?? [];
}

export function summarizeArchive(files: ArchiveFile[]): {
  count: number;
  names: string[];
  totalBytes: number;
} {
  let totalBytes = 0;
  for (const f of files) totalBytes += f.content.length;
  return { count: files.length, names: files.map((f) => f.name), totalBytes };
}

export function assertManifestShape(m: PapexManifest): void {
  if (!m || typeof m !== "object") throw new Error("manifest must be an object");
  if (!m.schemaVersion) throw new Error("schemaVersion is required");
  if (!m.paper?.title) throw new Error("paper.title is required");
  if (!m.paper?.abstract) throw new Error("paper.abstract is required");
  if (!m.paper?.primaryCategoryId) throw new Error("paper.primaryCategoryId is required");
  if (!Array.isArray(m.authors) || m.authors.length === 0) {
    throw new Error("authors must be a non-empty array");
  }
  if (!Array.isArray(m.sections) || m.sections.length === 0) {
    throw new Error("sections must be a non-empty array");
  }
}
