import { contextBridge, ipcRenderer } from "electron";

export interface WriterApi {
  platform(): Promise<string>;
  chooseDir(): Promise<string | null>;
  recent(): Promise<string[]>;
  openProject(root?: string): Promise<unknown>;
  createProject(root: string): Promise<unknown>;
  saveProject(payload: {
    root: string;
    manifest: unknown;
    files: { name: string; content: string }[];
    writerState?: unknown;
  }): Promise<boolean>;
  compile(root: string): Promise<unknown>;
  exportArchive(payload: {
    root: string;
    manifest: unknown;
    files: { name: string; content: string }[];
  }): Promise<unknown>;
  exportPdf(root: string): Promise<unknown>;
}

const api: WriterApi = {
  platform: () => ipcRenderer.invoke("app:platform"),
  chooseDir: () => ipcRenderer.invoke("dialog:chooseDir"),
  recent: () => ipcRenderer.invoke("project:recent"),
  openProject: (root?: string) => ipcRenderer.invoke("project:open", root),
  createProject: (root: string) => ipcRenderer.invoke("project:create", root),
  saveProject: (payload) => ipcRenderer.invoke("project:save", payload),
  compile: (root: string) => ipcRenderer.invoke("tex:compile", root),
  exportArchive: (payload) => ipcRenderer.invoke("export:archive", payload),
  exportPdf: (root: string) => ipcRenderer.invoke("export:pdf", root),
};

contextBridge.exposeInMainWorld("writer", api);
