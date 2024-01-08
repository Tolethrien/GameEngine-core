import System from "../../core/ecs/system";
import { TransformType } from "../components/transform";
import Tile from "../entities/tile";
const MAP_SCHEMA = {
  Tiles: 256,
  chunks: 256,
  tileSize: {
    width: 32,
    height: 32,
  },
  mapInChunks: { width: 16, height: 16 },
  mapInPixels: { width: 8192, height: 8192 },
  chunkSizeInPixels: { width: 16 * 32, height: 16 * 32 },
  chunkSizeInTiles: { width: 16, height: 16 },
};
const TILES_LUT = {
  40: [0, 32],
  41: [32, 32],
  42: [64, 32],
  43: [96, 32],
  80: [0, 64],
  81: [32, 64],
  82: [64, 64],
  83: [64, 64],
  120: [0, 96],
  121: [32, 96],
  122: [64, 96],
  123: [32, 96],
  160: [0, 128],
  161: [32, 128],
  162: [64, 128],
  163: [64, 128],
  200: [0, 160],
  201: [32, 160],
  202: [64, 160],
  203: [96, 160],
  15: [480, 0],
  16: [512, 0],
  17: [512, 0],
  55: [480, 32],
  56: [512, 32],
  57: [512, 32],
  95: [480, 64],
  96: [512, 64],
  97: [512, 64],
  135: [480, 96],
  136: [512, 96],
  137: [512, 96],
  44: [128, 32],

  367: [224, 288],
  368: [224, 288],
  369: [224, 288],
  370: [224, 288],
  371: [224, 288],
  372: [224, 288],

  407: [224, 288],
  408: [224, 288],
  409: [224, 288],
  410: [224, 288],
  411: [224, 288],
  412: [224, 288],

  447: [224, 288],
  448: [224, 288],
  449: [224, 288],
  450: [224, 288],
  451: [224, 288],
  452: [224, 288],

  487: [224, 288],
  488: [224, 288],
  489: [224, 288],
  490: [224, 288],
  491: [224, 288],
  492: [224, 288],

  527: [224, 288],
  528: [224, 288],
  529: [224, 288],
  530: [224, 288],
  531: [224, 288],
  532: [224, 288],
};
export default class LoadChunks extends System {
  loadedChunks!: number[];
  lastKnownLoadedChunks: number[];
  map!: object;
  loadingRange: number;
  entityTransform!: GetExplicitComponent<TransformType>;
  entityOnChunk: number;
  trackList: Map<number, string[]>;
  constructor(list: SystemProps) {
    super(list);
    this.entityOnChunk = -1;
    this.loadedChunks = [];
    this.lastKnownLoadedChunks = [];
    this.loadingRange = 3;
    this.trackList = new Map();
  }
  async onStart() {
    this.entityTransform = this.getEntityComponentByTag("Transform", "player");
    window.API.startSync("isMap", "isInd", {
      tiles: MAP_SCHEMA.Tiles,
      chunks: MAP_SCHEMA.chunks,
    });
    this.getFirstChunk();
    this.getSurroundingChunks();
    this.generateChunks(this.loadedChunks);
  }
  onUpdate() {
    const currentChunk = this.targetInChunk();
    if (this.entityOnChunk !== currentChunk) {
      this.entityOnChunk = currentChunk;
      this.getSurroundingChunks();
      this.manageChunkSwap();
    }
  }
  private getFirstChunk() {
    this.entityOnChunk = this.targetInChunk();
    if (this.entityOnChunk < 0 || this.entityOnChunk > MAP_SCHEMA.chunks)
      throw new Error(
        `Problem with setting first chunk, player is not overlaping with any map chunks. \r\nMake sure that player position is in valid spot on the map \r\nPlayerPosition:{x:${this.entityTransform.position.x},y:${this.entityTransform.position.y}},`
      );
  }

  private targetInChunk() {
    const chunkX = Math.floor(
      this.entityTransform.position.x / MAP_SCHEMA.chunkSizeInPixels.width
    );
    const chunkY = Math.floor(
      this.entityTransform.position.y / MAP_SCHEMA.chunkSizeInPixels.height
    );
    if (
      chunkX < 0 ||
      chunkX >= MAP_SCHEMA.mapInChunks.width ||
      chunkY < 0 ||
      chunkY >= MAP_SCHEMA.mapInChunks.height
    ) {
      return -1;
    }
    const indeksChunka = chunkY * 16 + chunkX;
    return indeksChunka;
  }
  private getSurroundingChunks() {
    const surroundingChunks: number[] = [];
    if (this.entityOnChunk == -1) return;
    const entityGridPos = {
      x: Math.floor(this.entityOnChunk / MAP_SCHEMA.mapInChunks.width),
      y: this.entityOnChunk % MAP_SCHEMA.mapInChunks.width,
    };
    for (let i = -this.loadingRange; i <= this.loadingRange; i++) {
      for (let j = -this.loadingRange; j <= this.loadingRange; j++) {
        const chunkGridPos = {
          x: entityGridPos.x + i,
          y: entityGridPos.y + j,
        };
        const chunkIndex =
          chunkGridPos.x * MAP_SCHEMA.mapInChunks.width + chunkGridPos.y;

        if (
          chunkGridPos.x >= 0 &&
          chunkGridPos.x < MAP_SCHEMA.mapInChunks.height &&
          chunkGridPos.y >= 0 &&
          chunkGridPos.y < MAP_SCHEMA.mapInChunks.width
        ) {
          surroundingChunks.push(chunkIndex);
        }
      }
    }
    this.lastKnownLoadedChunks = this.loadedChunks;
    this.loadedChunks = surroundingChunks;
  }

  private async generateChunks(addedChunks: number[]) {
    for (const chunkIndex of addedChunks) {
      const chunkMapData = await window.API.getChunk(chunkIndex);
      const tileList: string[] = [];
      for (let j = 0; j < MAP_SCHEMA.chunkSizeInTiles.height; j++) {
        for (let i = 0; i < MAP_SCHEMA.chunkSizeInTiles.width; i++) {
          const { tileIndex, tileX, tileY } = this.getTilePositionAndIndex(
            chunkIndex,
            i,
            j
          );
          new Tile({
            world: this.worldName,
            pos: { x: tileX, y: tileY },
            size: {
              height: MAP_SCHEMA.tileSize.height * 0.5,
              width: MAP_SCHEMA.tileSize.width * 0.5,
            },
            tileList: tileList,
            tileData: undefined,
            rigid: undefined,
            groundData: this.getGroundDataFromID(
              chunkMapData[tileIndex].grounds
            ),
          });
        }
      }
      this.trackList.set(chunkIndex, tileList);
    }
  }
  private async manageChunkSwap() {
    if (this.entityOnChunk === -1) return;
    const added = this.loadedChunks.filter(
      (chunk) => !this.lastKnownLoadedChunks.includes(chunk)
    );
    const removed = this.lastKnownLoadedChunks.filter(
      (chunk) => !this.loadedChunks.includes(chunk)
    );
    await this.generateChunks(added);
    this.removeChunks(removed);
  }
  private removeChunks(removedChunks: number[]) {
    removedChunks.forEach((chunkIndex) => {
      const tiles = this.trackList.get(chunkIndex);
      if (tiles) {
        tiles.forEach((tile) => this.deleteEntity(tile));
        this.trackList.delete(chunkIndex);
      }
    });
  }
  private getTilePositionAndIndex(
    chunkIndex: number,
    row: number,
    col: number
  ) {
    const tileX =
      (chunkIndex % MAP_SCHEMA.mapInChunks.width) *
        MAP_SCHEMA.chunkSizeInPixels.width +
      row * MAP_SCHEMA.tileSize.width +
      MAP_SCHEMA.tileSize.width * 0.5;
    const tileY =
      Math.floor(chunkIndex / MAP_SCHEMA.mapInChunks.height) *
        MAP_SCHEMA.chunkSizeInPixels.height +
      col * MAP_SCHEMA.tileSize.height +
      MAP_SCHEMA.tileSize.height * 0.5;
    const tileIndex = col * MAP_SCHEMA.chunkSizeInTiles.width + row;

    return { tileX, tileY, tileIndex };
  }
  private getGroundDataFromID(grounds: number[]) {
    const data: number[][] = [];
    grounds.forEach((ground) => {
      if (ground !== 0) {
        data.push([
          TILES_LUT[ground] ? TILES_LUT[ground][0] : 0,
          TILES_LUT[ground] ? TILES_LUT[ground][1] : 0,
          32,
          32,
        ]);
      }
    });
    return data;
  }
  temt() {
    const chunkX = Math.floor(
      this.entityTransform.position.x / MAP_SCHEMA.chunkSizeInPixels.width
    );
    const chunkY = Math.floor(
      this.entityTransform.position.y / MAP_SCHEMA.chunkSizeInPixels.height
    );
    if (
      chunkX < 0 ||
      chunkX >= MAP_SCHEMA.mapInChunks.width ||
      chunkY < 0 ||
      chunkY >= MAP_SCHEMA.mapInChunks.height
    ) {
      return { indeksChunka: -1, indeksKafelka: -1 };
    }
    const indeksChunka = chunkY * 16 + chunkX;

    // Obliczanie pozycji jednostki w chunku
    const tileX = Math.floor(
      (this.entityTransform.position.x % MAP_SCHEMA.chunkSizeInPixels.width) /
        MAP_SCHEMA.tileSize.width
    );
    const tileY = Math.floor(
      (this.entityTransform.position.y % MAP_SCHEMA.chunkSizeInPixels.height) /
        MAP_SCHEMA.tileSize.height
    );

    // Obliczanie indeksu kafelka w chunku
    const indeksKafelka = tileY * MAP_SCHEMA.chunkSizeInTiles.width + tileX;

    return { indeksChunka, indeksKafelka };
  }
  async tempt() {
    const { indeksChunka, indeksKafelka } = this.temt();
    const chunkMapData = await window.API.getChunk(indeksChunka);

    console.log(chunkMapData[indeksKafelka].grounds);
  }
}
