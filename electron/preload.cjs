const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("voidEdit", {
  openMedia: () => ipcRenderer.invoke("open-media"),
  saveProject: project => ipcRenderer.invoke("save-project", project),
  openProject: () => ipcRenderer.invoke("open-project")
});
