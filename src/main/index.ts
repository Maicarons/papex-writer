import { app, BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { registerIpc } from "./ipc";
import { createApplicationMenu } from "./menu";
import { loadRecents, saveRecent } from "./project/store";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: "Papex Writer",
    backgroundColor: "#0b1220",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow?.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // CLI/e2e: --project=/abs/path auto-opens after first paint
  const projArg = process.argv.find((a) => a.startsWith("--project="));
  const projDir = projArg?.slice("--project=".length) || process.env.PAPEX_E2E_PROJECT;
  if (projDir && mainWindow) {
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow?.webContents.send("project:autocreate-or-open", projDir);
    });
  }
}

app.whenReady().then(() => {
  registerIpc(() => mainWindow);
  createApplicationMenu();
  createWindow();
  void loadRecents();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

export { saveRecent };
