import { create } from "zustand";
import type {
  IdeaItem,
  ProjectFileEntry,
  WriterProjectState,
} from "@shared/types";
import { createDefaultWriterState } from "@shared/types";
import { createId, nowIso } from "@shared/id";
import type { PapexManifest } from "@latex-core/types";
import { createDefaultManifest, DEFAULT_SECTION_BODIES } from "@latex-core/default-manifest";

export type AppView =
  | "welcome"
  | "editor"
  | "ideation"
  | "meta"
  | "refs"
  | "export";

export interface CompileErrorVM {
  file?: string;
  line?: number;
  message: string;
  level: "error" | "warning";
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
  rightTab: "outline" | "pdf" | "refs" | "ai" | "review";
  recents: string[];
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

  setView: (v: AppView) => void;
  setRightTab: (t: AppState["rightTab"]) => void;
  setActiveSection: (file: string) => void;
  setEditorMode: (m: "source" | "visual") => void;
  setStatus: (s: string) => void;
  setSectionContent: (file: string, content: string) => void;
  setManifest: (m: PapexManifest) => void;
  loadRecents: () => Promise<void>;
  openProject: (root?: string) => Promise<void>;
  createProject: () => Promise<void>;
  saveProject: () => Promise<void>;
  runCompile: () => Promise<void>;
  exportArchive: () => Promise<void>;
  exportPdf: () => Promise<void>;
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
}

function filesToMap(files: ProjectFileEntry[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const f of files) m[f.name] = f.content;
  return m;
}

function mapToFiles(map: Record<string, string>): ProjectFileEntry[] {
  return Object.entries(map).map(([name, content]) => ({ name, content }));
}

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
  compile: { running: false, ok: false, log: "", errors: [], durationMs: 0 },
  ai: { output: "", running: false, lastTask: "" },
  mdPreview: { open: false, latex: "", target: "" },
  status: "就绪",

  setView: (view) => set({ view }),
  setRightTab: (rightTab) => set({ rightTab }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setEditorMode: (editorMode) => set({ editorMode }),
  setStatus: (status) => set({ status }),

  setSectionContent: (file, content) =>
    set((s) => ({ files: { ...s.files, [file]: content }, dirty: true })),

  setManifest: (manifest) => set({ manifest, dirty: true }),

  loadRecents: async () => {
    if (!window.writer) return;
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

  createProject: async () => {
    if (!window.writer) {
      set({ status: "桌面 API 不可用" });
      return;
    }
    const dir = await window.writer.chooseDir();
    if (!dir) return;
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
    set({
      status: res.ok ? `已导出 ${res.path}` : `导出失败：${res.error}`,
    });
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
}));
