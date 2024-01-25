import { ipcMain } from "electron";
import {
  MapSchema,
  endMapSync,
  getChunk,
  startMapSync,
} from "../backend/worldMap/getChunk";
import path from "path";
//TODO: dodac error handlery
export const IPCHandlers = () => {
  ipcMain.handle("getChunk", (event, chunk) => {
    return getChunk(chunk);
  });
  ipcMain.on(
    "startSync",
    (event, mapName: string, indexName: string, schema: MapSchema) => {
      startMapSync(
        path.join(__dirname, `../../src/assets/${mapName}.bin`),
        path.join(__dirname, `../../src/assets/${indexName}.bin`),
        schema
      );
      console.log("connection to file established");
    }
  );
  ipcMain.on("endSync", () => {
    endMapSync();
    console.log("connection to file terminated");
  });
};
