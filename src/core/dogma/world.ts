import { avalibleComponents } from "../../sandbox/ECSList";
export interface WorldType extends World {}
type MapData = { mapSchema: MapSchema; mapFile: string; indexFile: string };
export default class World {
  private components: Map<string, Map<string, ComponentType>>;
  private worldName: string;
  mapData: MapData | undefined;

  constructor(worldName: string) {
    this.components = new Map();
    this.worldName = worldName;
    this.mapData = undefined;
    Object.keys(avalibleComponents).forEach((component) => {
      this.components.set(component, new Map());
    });
  }
  public get getComponents() {
    return this.components;
  }
  public get getWorldName() {
    return this.worldName;
  }

  public get getMapData() {
    return this.mapData;
  }
  public set setMapData(mapData: MapData) {
    this.mapData = mapData;
  }
}
