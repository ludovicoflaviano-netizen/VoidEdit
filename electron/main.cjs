const { app, BrowserWindow, dialog, ipcMain, protocol } = require("electron");
const path = require("path");
const fs = require("fs/promises");

protocol.registerSchemesAsPrivileged([
  { scheme: "voidmedia", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

function createWindow() {
  const w = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1050, minHeight: 680,
    backgroundColor: "#090a0c",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (!app.isPackaged) w.loadURL("http://localhost:5173");
  else w.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  protocol.handle("voidmedia", async request => {
    const raw = decodeURIComponent(new URL(request.url).pathname);
    const filePath = process.platform === "win32" && raw.startsWith("/") ? raw.slice(1) : raw;
    try {
      return await net.fetch("file://" + filePath.replace(/\\/g, "/"));
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });

  ipcMain.handle("open-media", async () => {
    const r = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Media", extensions: ["mp4","mov","mkv","webm","mp3","wav","png","jpg","jpeg"] }]
    });
    return r.canceled ? [] : r.filePaths;
  });

  ipcMain.handle("save-project", async (_, project) => {
    const r = await dialog.showSaveDialog({
      defaultPath: "VoidEdit Project.voidedit",
      filters: [{ name: "VoidEdit Project", extensions: ["voidedit"] }]
    });
    if (r.canceled) return false;
    await fs.writeFile(r.filePath, JSON.stringify(project, null, 2), "utf8");
    return true;
  });

  ipcMain.handle("open-project", async () => {
    const r = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "VoidEdit Project", extensions: ["voidedit"] }]
    });
    if (r.canceled) return null;
    try { return JSON.parse(await fs.readFile(r.filePaths[0], "utf8")); }
    catch { return null; }
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
