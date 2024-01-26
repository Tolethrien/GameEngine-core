import { ChunkSchema } from "../../backend/worldMap/getChunk";
import EntityManager from "../../core/dogma/entityManager";
import System from "../../core/dogma/system";
import { TransformType } from "../components/transform";
import Tile, { GroundData, TileData } from "../entities/tile";

//TODO: jak robisz offsety obiektow i ich wielkosc to w sumie lepiej zacyznac od dolnego prawego rogu
// bo obiekty idą w gore(sa wieksze niz tile) wiec ma to sens by nie musiec offfsetowac tylko
// zawsze zaczynasz od odpowiedniego pixela ziemi

export default class LoadChunks extends System {
  loadedChunks!: number[];
  lastKnownLoadedChunks: number[];
  mapSchema!: MapSchema["MAP_INFO"]["sizes"];
  tilesLUT!: MapSchema["TILESET_LUT"];
  loadingRange: number;
  entityTransform!: GetExplicitComponent<TransformType>;
  entityOnChunk: number;
  trackList: Map<number, string[]>;
  constructor() {
    super();
    this.entityOnChunk = -1;
    this.loadedChunks = [];
    this.lastKnownLoadedChunks = [];
    this.loadingRange = 1;
    this.trackList = new Map();
  }
  onSubscribeList(): void {
    this.entityTransform = this.getEntityComponentByTag("Transform", "player");
  }
  async onStart() {
    const { indexFile, mapFile, mapSchema } = this.getMapData!;
    this.mapSchema = mapSchema.MAP_INFO.sizes;
    this.tilesLUT = mapSchema.TILESET_LUT;
    window.API.startSync(mapFile, indexFile, {
      tiles: this.mapSchema.chunk.InTiles.total,
      chunks: this.mapSchema.map.InChunks.total,
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

  private async manageChunkSwap() {
    if (this.entityOnChunk === -1) return;
    const added = this.loadedChunks.filter(
      (chunk) => !this.lastKnownLoadedChunks.includes(chunk)
    );
    const removed = this.lastKnownLoadedChunks.filter(
      (chunk) => !this.loadedChunks.includes(chunk)
    );
    this.generateChunks(added);
    this.removeChunks(removed);
  }
  private async generateChunks(addedChunks: number[]) {
    //TODO: out of focus na oknie na wiekszy czas psuje cos z usuwaniem chunkow bo niektore pozostają
    for (const chunkIndex of addedChunks) {
      const chunkMapData = await window.API.getChunk(chunkIndex);
      const tileList: string[] = [];
      for (let j = 0; j < this.mapSchema.chunk.InTiles.height; j++) {
        for (let i = 0; i < this.mapSchema.chunk.InTiles.width; i++) {
          const { tileIndex, tileX, tileY } = this.getTilePositionAndIndex(
            chunkIndex,
            i,
            j
          );
          const { groundData, isRigid, tileData } = this.getTileDatafromID(
            chunkMapData[tileIndex]
          );
          new Tile({
            pos: { x: tileX, y: tileY },
            size: {
              height: this.mapSchema.tile.height * 0.5,
              width: this.mapSchema.tile.width * 0.5,
            },
            tileList: tileList,
            tileData: tileData,
            rigid: isRigid ? "static-block" : undefined,
            groundData: groundData,
          });
        }
      }
      this.trackList.set(chunkIndex, tileList);
    }
  }

  private async removeChunks(removedChunks: number[]) {
    removedChunks.forEach((chunkIndex) => {
      const tiles = this.trackList.get(chunkIndex);
      if (tiles) {
        tiles.forEach((tile) => EntityManager.removeEntity(tile));
        this.trackList.delete(chunkIndex);
      }
    });
  }
  private getSurroundingChunks() {
    const surroundingChunks: number[] = [];
    if (this.entityOnChunk == -1) return;
    const entityGridPos = {
      x: Math.floor(this.entityOnChunk / this.mapSchema.map.InChunks.width),
      y: this.entityOnChunk % this.mapSchema.map.InChunks.width,
    };
    for (let i = -this.loadingRange; i <= this.loadingRange; i++) {
      for (let j = -this.loadingRange; j <= this.loadingRange; j++) {
        const chunkGridPos = {
          x: entityGridPos.x + i,
          y: entityGridPos.y + j,
        };
        const chunkIndex =
          chunkGridPos.x * this.mapSchema.map.InChunks.width + chunkGridPos.y;

        if (
          chunkGridPos.x >= 0 &&
          chunkGridPos.x < this.mapSchema.map.InChunks.height &&
          chunkGridPos.y >= 0 &&
          chunkGridPos.y < this.mapSchema.map.InChunks.width
        ) {
          surroundingChunks.push(chunkIndex);
        }
      }
    }
    this.lastKnownLoadedChunks = this.loadedChunks;
    this.loadedChunks = surroundingChunks;
  }
  private getFirstChunk() {
    this.entityOnChunk = this.targetInChunk();
    if (
      this.entityOnChunk < 0 ||
      this.entityOnChunk > this.mapSchema.map.InChunks.total
    )
      throw new Error(
        `Problem with setting first chunk, player is not overlaping with any map chunks. \r\nMake sure that player position is in valid spot on the map \r\nPlayerPosition:{x:${this.entityTransform.position.x},y:${this.entityTransform.position.y}},`
      );
  }
  private getTilePositionAndIndex(
    chunkIndex: number,
    row: number,
    col: number
  ) {
    const tileX =
      (chunkIndex % this.mapSchema.map.InChunks.width) *
        this.mapSchema.chunk.inPixels.width +
      row * this.mapSchema.tile.width +
      this.mapSchema.tile.width * 0.5;
    const tileY =
      Math.floor(chunkIndex / this.mapSchema.map.InChunks.height) *
        this.mapSchema.chunk.inPixels.height +
      col * this.mapSchema.tile.height +
      this.mapSchema.tile.height * 0.5;
    const tileIndex = col * this.mapSchema.chunk.InTiles.height + row;

    return { tileX, tileY, tileIndex };
  }
  private getTileDatafromID(data: ChunkSchema[0]) {
    const groundData: GroundData[] = [];
    const tileData: TileData[] = [];
    const isRigid = data.collider;
    data.grounds.forEach((ground) => {
      if (ground !== 0 && this.tilesLUT.grounds[ground]) {
        groundData.push([
          this.tilesLUT.grounds[ground].pos[0],
          this.tilesLUT.grounds[ground].pos[1],
          this.mapSchema.tile.width,
          this.mapSchema.tile.height,
        ]);
      }
    });
    for (let i = 0; i < data.tiles.length; i += 9) {
      if (data.tiles[i] !== 0 && this.tilesLUT.tiles[data.tiles[i]]) {
        tileData.push({
          crop: this.tilesLUT.tiles[data.tiles[i]].crop,
          offset: this.tilesLUT.tiles[data.tiles[i]].offset,
          tint: this.tilesLUT.tiles[data.tiles[i]].tint,
        });
      }
    }
    return { groundData, tileData, isRigid };
  }
  private targetInChunk() {
    const chunkX = Math.floor(
      this.entityTransform.position.x / this.mapSchema.chunk.inPixels.width
    );
    const chunkY = Math.floor(
      this.entityTransform.position.y / this.mapSchema.chunk.inPixels.height
    );
    if (
      chunkX < 0 ||
      chunkX >= this.mapSchema.map.InChunks.width ||
      chunkY < 0 ||
      chunkY >= this.mapSchema.map.InChunks.height
    ) {
      return -1;
    }
    const indeksChunka = chunkY * 16 + chunkX;
    return indeksChunka;
  }
}
