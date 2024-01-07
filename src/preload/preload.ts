import { contextBridge, ipcRenderer } from "electron";
import { MapSchema } from "../backend/worldMap/getChunk";

export const API = {
  startSync: (mapName: string, indexName: string, schema: MapSchema) =>
    ipcRenderer.send("startSync", mapName, indexName, schema),
  endSync: () => ipcRenderer.send("endSync"),
  getChunk: async (chunk: number) => {
    return await ipcRenderer.invoke("getChunk", chunk);
  },
};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("API", API);
  } catch (error) {
    console.error(error);
  }
}
