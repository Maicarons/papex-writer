import { app } from "electron";
import { join } from "node:path";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const MAX_RECENTS = 12;

function recentsFile(): string {
  const dir = app.getPath("userData");
  mkdirSync(dir, { recursive: true });
  return join(dir, "recents.json");
}

export async function loadRecents(): Promise<string[]> {
  try {
    const p = recentsFile();
    if (!existsSync(p)) return [];
    return JSON.parse(readFileSync(p, "utf-8")) as string[];
  } catch {
    return [];
  }
}

export async function saveRecent(root: string): Promise<string[]> {
  const list = await loadRecents();
  const next = [root, ...list.filter((x) => x !== root)].slice(0, MAX_RECENTS);
  writeFileSync(recentsFile(), JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export function appUserData(): string {
  return app.getPath("userData");
}
