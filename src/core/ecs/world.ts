import { EntityType } from "./entity";
import { nameToUpper } from "../../utils/helpers";
import { avalibleSystems, avalibleSystemsGroups } from "./ECSList";
import { ChunkType } from "../../map/chunk";
import MapECS from "../../map/map";
export interface ChunkMapJson {
  mapdata: {
    widthInChunks: number;
    heightInChunks: number;
    totalChunks: number;
    widthInPixels: number;
    heightInPixels: number;
    orientation: string;
    renderorder: string;
  };
  chunkData: {
    widthInTiles: number;
    heightInTiles: number;
    totalTilesInChunk: number;
    widthInPixels: number;
    heightInPixels: number;
  };
  tileData: {
    width: number;
    height: number;
  };
  chunks: {
    posInTiles: {
      x: number;
      y: number;
    };
    posInPixels: {
      x: number;
      y: number;
    };
    batchedMap: (number[] | null)[];
    tileMap: ({
      totalHeightInPixels: number;
      imageData: { x: number; y: number; tiles: number; z: number }[];
    } | null)[];
  }[];
}
export type AllChunks = Map<number, ChunkType>;
export type loadedChunks = number[];
export default class World {
  componentsLists: Map<string, Map<string, ComponentType>>;
  systemsList: Map<string, SystemType>;
  worldChunks: AllChunks;
  loadedChunks: loadedChunks;
  mapData: ChunkMapJson | undefined;

  private worldName: string;
  constructor(name: string) {
    this.componentsLists = new Map();
    this.systemsList = new Map();
    this.worldChunks = new Map();
    this.loadedChunks = [];
    this.mapData = undefined;
    this.worldName = name;
  }
  addSystem(system: Uncapitalize<keyof avalibleSystems>) {
    const createdSystem = new avalibleSystems[nameToUpper(system as keyof avalibleSystems)]({
      name: this.worldName
    } as SystemProps);
    this.systemsList.set(createdSystem.constructor.name, createdSystem);
  }
  addSystemsGroup(systemsGroup: Uncapitalize<keyof avalibleSystemsGroups>) {
    const createdSystemsGroup = new avalibleSystemsGroups[
      nameToUpper(systemsGroup as keyof avalibleSystemsGroups)
    ]({ name: this.worldName });
    this.systemsList.set(createdSystemsGroup.constructor.name, createdSystemsGroup);
  }
  removeSystem(name: string) {
    this.systemsList.delete(name);
  }
  clearWorld() {
    this.componentsLists.forEach((list) => list.clear());
  }
  onStart() {
    this.systemsList.forEach((system) => system.onStart());
  }
  onUpdate() {
    this.systemsList.forEach((system) => system.onUpdate());
  }

  getComponents(list: string, id: string) {
    return this.componentsLists.get(list)?.get(id);
  }
  addWorldMap(map: ChunkMapJson) {
    this.mapData = map;
    // new MapECS(map, this.worldChunks, this.worldName);
  }
  addEntity(entity: EntityType) {
    entity.world = this.worldName;
    entity.distributeComponents();
  }
  addActions() {}
}
