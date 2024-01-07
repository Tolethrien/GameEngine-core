import System from "../../core/ecs/system";
import { TransformType } from "../components/transform";
import Tile from "../entities/tile";
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
    this.loadingRange = 1;
    this.trackList = new Map();
  }
  onStart() {
    this.map = this.getMapData()!;
    window.API.startSync("isMap", "isInd", { tiles: 256, chunks: 256 });
    this.entityTransform = this.getEntityComponentByTag("Transform", "player");
    this.getFirstChunk();
    this.getSurroundingChunks();
    this.addTiles(this.loadedChunks);
    console.log(this.loadedChunks);
  }

  getSurroundingChunks() {
    const surroundingChunks: number[] = [];
    const mapChunkLengthX = this.map.mapdata.widthInChunks;
    const mapChunkLengthY = this.map.mapdata.heightInChunks;
    const entityGridPos = {
      x: Math.floor(this.entityOnChunk / mapChunkLengthX),
      y: this.entityOnChunk % mapChunkLengthX,
    };
    for (let i = -this.loadingRange; i <= this.loadingRange; i++) {
      for (let j = -this.loadingRange; j <= this.loadingRange; j++) {
        const chunkGridPos = {
          x: entityGridPos.x + i,
          y: entityGridPos.y + j,
        };
        const chunkIndex = chunkGridPos.x * mapChunkLengthX + chunkGridPos.y;

        if (
          chunkGridPos.x >= 0 &&
          chunkGridPos.x < mapChunkLengthY &&
          chunkGridPos.y >= 0 &&
          chunkGridPos.y < mapChunkLengthX
        ) {
          surroundingChunks.push(chunkIndex);
        }
      }
    }
    this.lastKnownLoadedChunks = this.loadedChunks;
    this.loadedChunks = surroundingChunks;
  }

  onUpdate() {
    for (const chunk of this.loadedChunks) {
      if (
        this.entityOnChunk !== chunk &&
        this.targetInChunk(
          this.map.chunks[chunk].posInPixels,
          this.map.chunkData
        )
      ) {
        this.entityOnChunk = chunk;
        this.getSurroundingChunks();
        this.manageTilesSwap();
        break;
      }
    }
  }
  private manageTilesSwap() {
    const added = this.loadedChunks.filter(
      (chunk) => !this.lastKnownLoadedChunks.includes(chunk)
    );
    const removed = this.lastKnownLoadedChunks.filter(
      (chunk) => !this.loadedChunks.includes(chunk)
    );
    this.addTiles(added);
    this.removeTiles(removed);
  }
  private addTiles(addedChunks: number[]) {
    const tileWidth = this.map.tileData.width;
    const tileHeight = this.map.tileData.height;
    addedChunks.forEach((chunkIndex) => {
      // window.API.getChunk(chunkIndex);
      const tileList: string[] = [];
      for (let j = 0; j < this.map.chunkData.heightInTiles; j++) {
        for (let i = 0; i < this.map.chunkData.widthInTiles; i++) {
          const centerX =
            this.map.chunks[chunkIndex].posInPixels.x +
            i * tileWidth +
            tileWidth / 2;
          const centerY =
            this.map.chunks[chunkIndex].posInPixels.y +
            j * tileHeight +
            tileHeight / 2;
          const tileIndex = j * this.map.chunkData.widthInTiles + i;
          new Tile({
            world: this.worldName,
            pos: { x: centerX, y: centerY },
            size: { height: tileHeight / 2, width: tileWidth / 2 },
            tileList: tileList,
            tileData: this.map.chunks[chunkIndex].tiles[tileIndex].world.length
              ? this.map.chunks[chunkIndex].tiles[tileIndex].world
              : undefined,
            rigid: this.map.chunks[chunkIndex].tiles[tileIndex].collider.is
              ? "static-block"
              : undefined,
            groundData: this.map.chunks[chunkIndex].tiles[tileIndex].ground
              .length
              ? this.map.chunks[chunkIndex].tiles[tileIndex].ground
              : undefined,
          });
        }
      }
      this.trackList.set(chunkIndex, tileList);
    });
  }

  private removeTiles(removedChunks: number[]) {
    removedChunks.forEach((chunkIndex) => {
      const tiles = this.trackList.get(chunkIndex);
      if (tiles) {
        tiles.forEach((tile) => this.deleteEntity(tile));
        this.trackList.delete(chunkIndex);
      }
    });
  }
  private getFirstChunk() {
    const targetChunk = this.map.chunks.findIndex((chunk) =>
      this.targetInChunk(chunk.posInPixels, this.map.chunkData)
    );
    this.entityOnChunk = targetChunk;
    if (this.entityOnChunk === -1)
      throw new Error(
        `Problem with setting first chunk, player is not overlaping with any map chunks. \r\nMake sure that player position is in valid spot on the map \r\nPlayerPosition:{x:${this.entityTransform.position.x},y:${this.entityTransform.position.y}},`
      );
  }

  targetInChunk(
    chunkPosition: { x: number; y: number },
    chunkData: ChunkMapJson["chunkData"]
  ) {
    //TODO: jeden pixel rowny koncowi chunka i poczatkowi nstepnego sprawi ze swiat nie bedzie sie wczytywal jesli po nim idealnie bedzie szedl gracz(<=)
    return (
      this.entityTransform.position.x > chunkPosition.x &&
      this.entityTransform.position.x <
        chunkPosition.x + chunkData.widthInPixels &&
      this.entityTransform.position.y > chunkPosition.y &&
      this.entityTransform.position.y <
        chunkPosition.y + chunkData.heightInPixels &&
      true
    );
  }
}
