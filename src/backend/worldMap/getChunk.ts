import { openSync, readSync, closeSync } from "fs";
export interface MapSchema {
  tiles: number;
  chunks: number;
}
let indexSync: number;
let fileSync: number;
let schema: MapSchema;
export type ChunkSchema = {
  grounds: number[];
  tiles: number[];
  collider: boolean;
}[];
export const startMapSync = (
  mapfile: string,
  indexFile: string,
  mapData: MapSchema
) => {
  indexSync = openSync(indexFile, "r");
  fileSync = openSync(mapfile, "r");
  schema = mapData;
};
export const endMapSync = () => {
  closeSync(indexSync);
  closeSync(fileSync);
};
export const getChunk = (chunk: number): ChunkSchema => {
  const indexBuffer = Buffer.alloc(
    (schema.tiles + 1) * Uint32Array.BYTES_PER_ELEMENT
  );
  readSync(
    indexSync,
    indexBuffer,
    0,
    (schema.tiles + 1) * Uint32Array.BYTES_PER_ELEMENT,
    chunk * (schema.tiles + 1) * Uint32Array.BYTES_PER_ELEMENT
  );
  const indexedData = [];
  for (let i = 0; i < indexBuffer.length; i += 4) {
    indexedData.push(indexBuffer.readUInt32LE(i));
  }
  const chunkStart = indexedData.shift()!;
  const chunkLength = indexedData.reduce((acc, value) => {
    return (acc += value);
  }, 0);

  //read map
  const buffer = Buffer.alloc(chunkLength * Uint16Array.BYTES_PER_ELEMENT);
  readSync(
    fileSync,
    buffer,
    0,
    chunkLength * Uint16Array.BYTES_PER_ELEMENT,
    chunkStart * Uint16Array.BYTES_PER_ELEMENT
  );
  const data = [];
  for (let i = 0; i < buffer.length; i += 2) {
    data.push(buffer.readUInt16LE(i));
  }

  return mapData(data, indexedData);
};
function mapData(chunk: number[], sizes: number[]) {
  const data = [];
  let index = 0;
  for (let i = 0; i < sizes.length; i++) {
    const tile = chunk.slice(index, index + sizes[i]);
    const dat = {
      grounds: tile.slice(2, 2 + tile[1]),
      tiles: tile.slice(2 + tile[1]),
      collider: tile[0] === 0 ? false : true,
    };
    data.push(dat);
    index += sizes[i];
  }
  return data;
}
