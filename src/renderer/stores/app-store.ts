import { create } from "zustand";
import type {
  IdeaItem,
  ProjectFileEntry,
  ReviewChange,
  ReviewComment,
  WriterProjectState,
} from "@shared/types";
import { createDefaultWriterState } from "@shared/types";
import { createId, nowIso } from "@shared/id";
import type { PapexManifest, PapexReference } from "@latex-core/types";
import { createDefaultManifest, DEFAULT_SECTION_BODIES } from "@latex-core/default-manifest";
import { parseBibLite } from "@/lib/bib-parse";

export type AppView =
  | "welcome"
  | "editor"
  | "ideation"
  | "meta"
  | "refs"
  | "export"
  | "ecosystem";

export type Lang = "zh" | "en";

export interface CompileErrorVM {
  file?: string;
  line?: number;
  message: string;
  level: "error" | "warning";
}

interface SnapshotPayload {
  id: string;
  label: string;
  createdAt: string;
  files: Record<string, string>;
  manifest: PapexManifest;
}

interface AppState {
  ready: boolean;
  view: AppView;
  root: string | null;
  manifest: PapexManifest;
  files: Record<string, string>;
  writer: WriterProjectState;
  dirty: boolean;
  activeSection: string;
  editorMode: "source" | "visual";
  rightTab: "outline" | "pdf" | "refs" | "ai" | "review" | "search" | "git";
  recents: string[];
  lang: Lang;
  revealLine: number | null;
  compile: {
    running: boolean;
    ok: boolean;
    pdfPath?: string;
    log: string;
    errors: CompileErrorVM[];
    durationMs: number;
  };
  ai: {
    output: string;
    running: boolean;
    lastTask: string;
  };
  mdPreview: { open: boolean; latex: string; target: string };
  status: string;
  snapshotsData: Record<string, SnapshotPayload>;

  setView: (v: AppView) => void;
  setRightTab: (t: AppState["rightTab"]) => void;
  setActiveSection: (file: string) => void;
  setEditorMode: (m: "source" | "visual") => void;
  setStatus: (s: string) => void;
  setLang: (l: Lang) => void;
  setRevealLine: (n: number | null) => void;
  setSectionContent: (file: string, content: string) => void;
  setManifest: (m: PapexManifest) => void;
  loadRecents: () => Promise<void>;
  openProject: (root?: string) => Promise<void>;
  createProject: (root?: string) => Promise<void>;
  createFromTemplate: (kind: "blank" | "sample" | "template") => Promise<void>;
  saveProject: () => Promise<void>;
  runCompile: () => Promise<void>;
  exportArchive: () => Promise<void>;
  exportPdf: () => Promise<void>;
  importBib: (bibText: string) => number;
  exportBib: () => string;
  addIdea: (title: string, body: string, tags: string[]) => void;
  updateIdea: (id: string, patch: Partial<IdeaItem>) => void;
  removeIdea: (id: string) => void;
  addSection: (title: string) => void;
  removeSection: (file: string) => void;
  moveSection: (file: string, dir: -1 | 1) => void;
  setAiOutput: (text: string) => void;
  setAiRunning: (b: boolean) => void;
  openMdPreview: (latex: string, target: string) => void;
  closeMdPreview: () => void;
  insertMdLatex: () => void;
  addComment: (c: ReviewComment) => void;
  resolveComment: (id: string) => void;
  addChange: (c: ReviewChange) => void;
  acceptChange: (id: string) => void;
  rejectChange: (id: string) => void;
  addSnapshot: (label: string) => void;
  restoreSnapshot: (id: string) => void;
}

function filesToMap(files: ProjectFileEntry[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const f of files) m[f.name] = f.content;
  return m;
}

function mapToFiles(map: Record<string, string>): ProjectFileEntry[] {
  return Object.entries(map).map(([name, content]) => ({ name, content }));
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

export const useApp = create<AppState>((set, get) => ({
  ready: false,
  view: "welcome",
  root: null,
  manifest: createDefaultManifest(),
  files: {
    "sections/00-intro.tex": DEFAULT_SECTION_BODIES["sections/00-intro.tex"],
    "sections/01-method.tex": DEFAULT_SECTION_BODIES["sections/01-method.tex"],
    "sections/02-experiments.tex": DEFAULT_SECTION_BODIES["sections/02-experiments.tex"],
    "sections/03-conclusion.tex": DEFAULT_SECTION_BODIES["sections/03-conclusion.tex"],
  },
  writer: createDefaultWriterState(),
  dirty: false,
  activeSection: "sections/00-intro.tex",
  editorMode: "source",
  rightTab: "outline",
  recents: [],
  lang: "zh",
  revealLine: null,
  compile: { running: false, ok: false, log: "", errors: [], durationMs: 0 },
  ai: { output: "", running: false, lastTask: "" },
  mdPreview: { open: false, latex: "", target: "" },
  status: "就绪",
  snapshotsData: {},

  setView: (view) => set({ view }),
  setRightTab: (rightTab) => set({ rightTab }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setEditorMode: (editorMode) => set({ editorMode }),
  setStatus: (status) => set({ status }),
  setLang: (lang) => set({ lang }),
  setRevealLine: (revealLine) => set({ revealLine }),

  setSectionContent: (file, content) => {
    set((s) => ({ files: { ...s.files, [file]: content }, dirty: true }));
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      const s = get();
      if (s.root && s.dirty) void s.saveProject();
    }, 1500);
  },

  setManifest: (manifest) => {
    set({ manifest, dirty: true });
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      const s = get();
      if (s.root && s.dirty) void s.saveProject();
    }, 1500);
  },

  loadRecents: async () => {
    if (!window.writer) {
      set({ ready: true });
      return;
    }
    const recents = await window.writer.recent();
    set({ recents, ready: true });
  },

  openProject: async (root) => {
    if (!window.writer) {
      set({ status: "桌面 API 不可用（请在 Electron 中运行）" });
      return;
    }
    const project = (await window.writer.openProject(root)) as {
      root: string;
      manifest: PapexManifest;
      files: ProjectFileEntry[];
      writerState?: WriterProjectState;
    } | null;
    if (!project) {
      set({ status: "未打开项目" });
      return;
    }
    const first = project.files.find((f) => f.name.endsWith(".tex"));
    set({
      root: project.root,
      manifest: project.manifest,
      files: filesToMap(project.files),
      writer: project.writerState ?? createDefaultWriterState(),
      activeSection: first?.name ?? "sections/00-intro.tex",
      view: "editor",
      dirty: false,
      status: `已打开 ${project.root}`,
    });
    void get().loadRecents();
  },

  createProject: async (dirArg?: string) => {
    if (!window.writer) {
      set({ status: "桌面 API 不可用" });
      return;
    }
    let dir = dirArg;
    if (!dir) {
      const chosen = await window.writer.chooseDir();
      if (!chosen) return;
      dir = chosen;
    }
    const project = (await window.writer.createProject(dir)) as {
      root: string;
      manifest: PapexManifest;
      files: ProjectFileEntry[];
      writerState?: WriterProjectState;
    } | null;
    if (!project) return;
    const first = project.files.find((f) => f.name.endsWith(".tex"));
    set({
      root: project.root,
      manifest: project.manifest,
      files: filesToMap(project.files),
      writer: project.writerState ?? createDefaultWriterState(),
      activeSection: first?.name ?? "sections/00-intro.tex",
      view: "editor",
      dirty: false,
      status: `已创建 ${project.root}`,
    });
    void get().loadRecents();
  },

  createFromTemplate: async (kind) => {
    const before = get().root;
    await get().createProject();
    const after = get().root;
    if (!after || after === before) {
      // dialog cancelled or failed — do not mutate
      return;
    }
    if (kind === "sample") {
      const s = get();
      set({
        manifest: {
          ...s.manifest,
          paper: {
            ...s.manifest.paper,
            title: "示例论文：双模学术写作工作台",
            abstract:
              "本文介绍一种源码与所见即所得双模的学术写作工作台，支持 Markdown 转写与全流程 AI 辅助。",
            keywords: ["学术写作", "LaTeX", "编辑器"],
          },
        },
        files: {
          ...s.files,
          "sections/00-intro.tex":
            "\\section{引言}\n\n学术写作需要在结构、引用与排版之间反复迭代。Papex Writer 以 papex-latex 为契约，提供本地优先的写作体验。\n\n",
          "sections/01-method.tex":
            "\\section{方法}\n\n\\subsection{双模编辑}\n\n源码是唯一真相，Visual 模式是投影层。\n\n\\begin{itemize}\n  \\item 源码模式：精确控制\n  \\item Visual 模式：快速成文\n\\end{itemize}\n",
        },
        dirty: true,
        view: "editor",
        status: "已创建示例项目",
      });
    } else {
      set({ view: "editor", status: kind === "template" ? "已创建模板项目" : "已创建空白项目" });
    }
  },

  saveProject: async () => {
    const s = get();
    if (!window.writer || !s.root) return;
    await window.writer.saveProject({
      root: s.root,
      manifest: s.manifest,
      files: mapToFiles(s.files),
      writerState: s.writer,
    });
    set({ dirty: false, status: "已保存" });
  },

  runCompile: async () => {
    const s = get();
    if (!window.writer || !s.root) {
      set({ status: "请先打开项目" });
      return;
    }
    set({ compile: { ...s.compile, running: true }, status: "编译中…" });
    if (s.dirty) await get().saveProject();
    const result = (await window.writer.compile(s.root)) as {
      ok: boolean;
      pdfPath?: string;
      log: string;
      errors: CompileErrorVM[];
      durationMs: number;
    };
    set({
      compile: {
        running: false,
        ok: result.ok,
        pdfPath: result.pdfPath,
        log: result.log,
        errors: result.errors,
        durationMs: result.durationMs,
      },
      rightTab: "pdf",
      status: result.ok ? `编译成功（${Math.round(result.durationMs / 1000)}s）` : "编译失败",
    });
  },

  exportArchive: async () => {
    const s = get();
    if (!window.writer || !s.root) return;
    if (s.dirty) await get().saveProject();
    const res = (await window.writer.exportArchive({
      root: s.root,
      manifest: s.manifest,
      files: mapToFiles(s.files),
    })) as { ok: boolean; path?: string; error?: string; files: string[] };
    set({ status: res.ok ? `已导出 ${res.path}` : `导出失败：${res.error}` });
  },

  exportPdf: async () => {
    const s = get();
    if (!window.writer || !s.root) return;
    const res = (await window.writer.exportPdf(s.root)) as {
      ok: boolean;
      path?: string;
      error?: string;
    };
    set({ status: res.ok ? `PDF 已导出 ${res.path}` : `导出失败：${res.error}` });
  },

  importBib: (bibText) => {
    const entries = parseBib(bibText);
    set((s) => {
      const existing = new Set((s.manifest.references ?? []).map((r) => r.key));
      const added = entries
        .filter((e) => !existing.has(e.key))
        .map((e) => ({
          key: e.key,
          type: e.type as PapexReference["type"],
          title: e.title,
          author: e.author,
          year: e.year,
          journal: e.journal,
        }));
      return {
        manifest: {
          ...s.manifest,
          references: [...(s.manifest.references ?? []), ...added],
        },
        dirty: true,
      };
    });
    return entries.length;
  },

  exportBib: () => {
    const refs = get().manifest.references ?? [];
    return refs
      .map((r) => {
        const fields = [
          r.author ? `  author = {${r.author}}` : null,
          r.title ? `  title = {${r.title}}` : null,
          r.journal ? `  journal = {${r.journal}}` : null,
          r.booktitle ? `  booktitle = {${r.booktitle}}` : null,
          r.year != null ? `  year = {${r.year}}` : null,
          r.doi ? `  doi = {${r.doi}}` : null,
          r.url ? `  url = {${r.url}}` : null,
        ].filter(Boolean);
        return `@${r.type ?? "misc"}{${r.key},\n${fields.join(",\n")}\n}`;
      })
      .join("\n\n");
  },

  addIdea: (title, body, tags) =>
    set((s) => ({
      writer: {
        ...s.writer,
        ideas: [
          {
            id: createId(),
            title,
            body,
            tags,
            status: "inbox" as const,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          },
          ...s.writer.ideas,
        ],
      },
      dirty: true,
    })),

  updateIdea: (id, patch) =>
    set((s) => ({
      writer: {
        ...s.writer,
        ideas: s.writer.ideas.map((i) =>
          i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i,
        ),
      },
      dirty: true,
    })),

  removeIdea: (id) =>
    set((s) => ({
      writer: { ...s.writer, ideas: s.writer.ideas.filter((i) => i.id !== id) },
      dirty: true,
    })),

  addSection: (title) =>
    set((s) => {
      const n = Object.keys(s.files).filter((k) => k.startsWith("sections/")).length;
      const file = `sections/${String(n).padStart(2, "0")}-${Date.now().toString(36)}.tex`;
      return {
        manifest: {
          ...s.manifest,
          sections: [
            ...s.manifest.sections,
            { id: file, title, file, level: "section" as const },
          ],
        },
        files: { ...s.files, [file]: `\\section{${title}}\n\n` },
        activeSection: file,
        dirty: true,
      };
    }),

  removeSection: (file) =>
    set((s) => {
      const files = { ...s.files };
      delete files[file];
      const next = Object.keys(files).find((k) => k.endsWith(".tex"));
      return {
        manifest: {
          ...s.manifest,
          sections: s.manifest.sections.filter((x) => x.file !== file),
        },
        files,
        activeSection: s.activeSection === file ? next ?? "" : s.activeSection,
        dirty: true,
      };
    }),

  moveSection: (file, dir) =>
    set((s) => {
      const idx = s.manifest.sections.findIndex((x) => x.file === file);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= s.manifest.sections.length) return s;
      const sections = [...s.manifest.sections];
      const tmp = sections[idx];
      sections[idx] = sections[j];
      sections[j] = tmp;
      return { manifest: { ...s.manifest, sections }, dirty: true };
    }),

  setAiOutput: (output) => set((s) => ({ ai: { ...s.ai, output } })),
  setAiRunning: (running) => set((s) => ({ ai: { ...s.ai, running } })),

  openMdPreview: (latex, target) => set({ mdPreview: { open: true, latex, target } }),
  closeMdPreview: () => set({ mdPreview: { open: false, latex: "", target: "" } }),

  insertMdLatex: () => {
    const s = get();
    const target = s.mdPreview.target || s.activeSection;
    const prev = s.files[target] ?? "";
    set({
      files: { ...s.files, [target]: prev + "\n\n" + s.mdPreview.latex + "\n" },
      mdPreview: { open: false, latex: "", target: "" },
      dirty: true,
      status: "Markdown 已转写并插入",
    });
  },

  addComment: (c) =>
    set((s) => ({
      writer: {
        ...s.writer,
        review: { ...s.writer.review, comments: [c, ...s.writer.review.comments] },
      },
      dirty: true,
    })),

  resolveComment: (id) =>
    set((s) => ({
      writer: {
        ...s.writer,
        review: {
          ...s.writer.review,
          comments: s.writer.review.comments.map((c) =>
            c.id === id ? { ...c, resolved: true } : c,
          ),
        },
      },
      dirty: true,
    })),

  addChange: (c) =>
    set((s) => ({
      writer: {
        ...s.writer,
        review: { ...s.writer.review, changes: [c, ...s.writer.review.changes] },
      },
      dirty: true,
    })),

  acceptChange: (id) =>
    set((s) => {
      const change = s.writer.review.changes.find((c) => c.id === id);
      if (!change) return s;
      const content = s.files[change.section] ?? "";
      let next = content;
      if (change.type === "insert") {
        next = content.slice(0, change.from) + change.text + content.slice(change.from);
      } else {
        next = content.slice(0, change.from) + content.slice(change.to);
      }
      return {
        files: { ...s.files, [change.section]: next },
        writer: {
          ...s.writer,
          review: {
            ...s.writer.review,
            changes: s.writer.review.changes.filter((c) => c.id !== id),
          },
        },
        dirty: true,
      };
    }),

  rejectChange: (id) =>
    set((s) => ({
      writer: {
        ...s.writer,
        review: {
          ...s.writer.review,
          changes: s.writer.review.changes.filter((c) => c.id !== id),
        },
      },
      dirty: true,
    })),

  addSnapshot: (label) =>
    set((s) => {
      const id = createId();
      const payload: SnapshotPayload = {
        id,
        label,
        createdAt: nowIso(),
        files: { ...s.files },
        manifest: s.manifest,
      };
      return {
        snapshotsData: { ...s.snapshotsData, [id]: payload },
        writer: {
          ...s.writer,
          snapshots: [
            { id, label, createdAt: payload.createdAt },
            ...s.writer.snapshots,
          ],
        },
        dirty: true,
      };
    }),

  restoreSnapshot: (id) =>
    set((s) => {
      const snap = s.snapshotsData[id];
      if (!snap) return s;
      return {
        files: { ...snap.files },
        manifest: snap.manifest,
        dirty: true,
        status: `已恢复快照「${snap.label}」`,
      };
    }),
}));

function parseBib(text: string): { key: string; type?: string; title?: string; author?: string; year?: number; journal?: string }[] {
  return parseBibLite(text);
}
