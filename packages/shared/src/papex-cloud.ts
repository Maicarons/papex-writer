/**
 * Papex cloud API client (M5).
 * Talks to a Papex server's REST endpoints using an API key.
 * Fully optional — app works offline without any cloud config.
 */

export interface PapexCloudConfig {
  baseUrl: string;
  apiKey: string;
  /** When false, cloud features are disabled. */
  enabled: boolean;
}

export interface PapexCategory {
  id: string;
  name: string;
  nameZh?: string;
}

export interface SubmitResult {
  ok: boolean;
  paperId?: string;
  version?: number;
  error?: string;
}

function authHeaders(cfg: PapexCloudConfig): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
  };
}

async function apiGet<T>(cfg: PapexCloudConfig, path: string): Promise<T> {
  const res = await fetch(cfg.baseUrl.replace(/\/$/, "") + path, {
    headers: authHeaders(cfg),
  });
  if (!res.ok) throw new Error(`Papex API ${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchCategories(cfg: PapexCloudConfig): Promise<PapexCategory[]> {
  if (!cfg.enabled) return [];
  return apiGet<PapexCategory[]>(cfg, "/api/categories");
}

export async function uploadArchive(
  cfg: PapexCloudConfig,
  archiveBlob: Blob,
  filename = "submission.tar.gz",
): Promise<SubmitResult> {
  if (!cfg.enabled) {
    return { ok: false, error: "cloud disabled" };
  }
  try {
    const fd = new FormData();
    fd.append("file", archiveBlob, filename);
    const res = await fetch(cfg.baseUrl.replace(/\/$/, "") + "/api/submit/archive", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      body: fd,
    });
    const data = (await res.json()) as {
      error?: string;
      paperId?: string;
      id?: string;
      version?: number;
      latest_version?: number;
    };
    if (!res.ok) return { ok: false, error: data.error ?? `HTTP ${res.status}` };
    return {
      ok: true,
      paperId: data.paperId ?? data.id,
      version: data.version ?? data.latest_version,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function healthCheck(cfg: PapexCloudConfig): Promise<boolean> {
  if (!cfg.enabled || !cfg.baseUrl) return false;
  try {
    const res = await fetch(cfg.baseUrl.replace(/\/$/, "") + "/api/health");
    return res.ok;
  } catch {
    return false;
  }
}
