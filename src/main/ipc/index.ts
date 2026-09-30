import { dialog, ipcMain, type BrowserWindow } from "electron";
import type { OpenProjectResult, ProjectFileEntry, WriterProjectState } from "@shared/types";
import { createProject, openProject, saveProject } from "../project/project-service";
import { loadRecents, saveRecent } from "../project/store";
import { compileProject } from "../tex/compile";
import { exportArchive, exportPdf } from "../export/export-service";

export function registerIpc(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle("app:platform", () => process.platform);

  ipcMain.handle("dialog:chooseDir", async () => {
    const win = getWindow();
    const res = await dialog.showOpenDialog(win ?? undefined!, {
      properties: ["openDirectory", "createDirectory"],
    });
    if (res.canceled || !res.filePaths[0]) return null;
    return res.filePaths[0];
  });

  ipcMain.handle("project:recent", () => loadRecents());

  ipcMain.handle("project:open", async (_e, root?: string) => {
    let dir = root;
    if (!dir) {
      const win = getWindow();
      const res = await dialog.showOpenDialog(win ?? undefined!, {
        properties: ["openDirectory", "createDirectory"],
      });
      if (res.canceled || !res.filePaths[0]) return null;
      dir = res.filePaths[0];
    }
    const project = openProject(dir);
    if (project) await saveRecent(dir);
    return project;
  });

  ipcMain.handle("project:create", async (_e, root: string) => {
    const project = createProject(root);
    if (project) await saveRecent(root);
    return project;
  });

  ipcMain.handle(
    "project:save",
    async (
      _e,
      payload: {
        root: string;
        manifest: unknown;
        files: ProjectFileEntry[];
        writerState?: WriterProjectState;
      },
    ) => {
      const ok = saveProject(payload);
      if (ok) await saveRecent(payload.root);
      return ok;
    },
  );

  ipcMain.handle("tex:compile", async (_e, root: string) => compileProject(root));

  ipcMain.handle(
    "export:archive",
    async (_e, payload: { root: string; manifest: unknown; files: ProjectFileEntry[] }) =>
      exportArchive(payload),
  );

  ipcMain.handle("export:pdf", async (_e, root: string) => exportPdf(root));
}

export type { OpenProjectResult };
