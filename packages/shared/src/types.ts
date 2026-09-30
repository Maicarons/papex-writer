/** Shared types between Electron main and renderer. */

export interface IdeaItem {
  id: string;
  title: string;
  body: string;
  tags: string[];
  status: "inbox" | "linked" | "archived";
  targetSectionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  id: string;
  section: string;
  from: number;
  to: number;
  body: string;
  resolved: boolean;
  createdAt: string;
}

export interface ReviewChange {
  id: string;
  type: "insert" | "delete";
  section: string;
  from: number;
  to: number;
  text: string;
  createdAt: string;
}

export interface WriterProjectState {
  writerVersion: string;
  ideas: IdeaItem[];
  editor: {
    mode: "source" | "visual";
    ai: {
      enabled: boolean;
      provider: "ollama" | "openai-compatible" | "anthropic" | "custom";
      baseUrl: string;
      model: string;
      features: {
        continuation: boolean;
        polish: boolean;
        review: boolean;
        [key: string]: boolean;
      };
    };
  };
  review: {
    comments: ReviewComment[];
    changes: ReviewChange[];
  };
  ui: {
    sidebarWidth: number;
    activeRightTab: string;
  };
  snapshots: { id: string; label: string; createdAt: string }[];
}

export interface ProjectFileEntry {
  name: string;
  content: string;
}

export interface OpenProjectResult {
  root: string;
  manifest: unknown;
  files: ProjectFileEntry[];
  writerState: WriterProjectState | null;
}

export interface CompileResult {
  ok: boolean;
  pdfPath?: string;
  log: string;
  errors: CompileError[];
  durationMs: number;
}

export interface CompileError {
  file?: string;
  line?: number;
  message: string;
  level: "error" | "warning";
}

export interface ExportResult {
  ok: boolean;
  path?: string;
  error?: string;
  files: string[];
}

export type IpcChannels = {
  "project:open": { args: [string?]; result: OpenProjectResult | null };
  "project:create": { args: [string]; result: OpenProjectResult | null };
  "project:save": {
    args: [{ root: string; manifest: unknown; files: ProjectFileEntry[]; writerState?: WriterProjectState }];
    result: boolean;
  };
  "project:recent": { args: []; result: string[] };
  "tex:compile": { args: [string]; result: CompileResult };
  "export:archive": {
    args: [{ root: string; manifest: unknown; files: ProjectFileEntry[] }];
    result: ExportResult;
  };
  "export:pdf": { args: [string]; result: ExportResult };
  "dialog:chooseDir": { args: []; result: string | null };
  "app:platform": { args: []; result: string };
};

export function createDefaultWriterState(): WriterProjectState {
  return {
    writerVersion: "0.1.0",
    ideas: [],
    editor: {
      mode: "source",
      ai: {
        enabled: true,
        provider: "ollama",
        baseUrl: "http://127.0.0.1:11434",
        model: "llama3",
        features: {
          continuation: false,
          polish: true,
          review: true,
        },
      },
    },
    review: { comments: [], changes: [] },
    ui: { sidebarWidth: 260, activeRightTab: "outline" },
    snapshots: [],
  };
}
