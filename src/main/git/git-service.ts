/**
 * Git panel support (M5): read-only status of the project folder via system git.
 */
import { spawn } from "node:child_process";

export interface GitStatusLine {
  code: string;
  path: string;
}

export interface GitSnapshot {
  ok: boolean;
  branch?: string;
  clean?: boolean;
  entries: GitStatusLine[];
  error?: string;
}

function git(args: string[], cwd: string): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", args, { cwd, windowsHide: true, shell: false });
    let out = "";
    child.stdout.on("data", (d) => (out += String(d)));
    child.stderr.on("data", (d) => (out += String(d)));
    child.on("error", (e) => resolve({ code: -1, out: e.message }));
    child.on("close", (code) => resolve({ code, out }));
  });
}

export async function gitStatus(cwd: string): Promise<GitSnapshot> {
  const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  if (branch.code !== 0) {
    return { ok: false, entries: [], error: branch.out.trim() || "not a git repository" };
  }
  const status = await git(["status", "--porcelain"], cwd);
  const entries: GitStatusLine[] = status.out
    .split("\n")
    .filter(Boolean)
    .map((line) => ({ code: line.slice(0, 2).trim() || "??", path: line.slice(3) }));
  return {
    ok: true,
    branch: branch.out.trim(),
    clean: entries.length === 0,
    entries,
  };
}

export async function gitCommitAll(cwd: string, message: string): Promise<{ ok: boolean; out: string }> {
  const add = await git(["add", "-A"], cwd);
  if (add.code !== 0) return { ok: false, out: add.out };
  const commit = await git(["commit", "-m", message], cwd);
  return { ok: commit.code === 0, out: commit.out };
}
