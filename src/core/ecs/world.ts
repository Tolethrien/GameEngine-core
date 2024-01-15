import {
  avalibleSystems,
  avalibleSystemsGroups,
  avalibleComponents,
} from "../../sandbox/ECSList";
import Engine from "../engine";
import Dispatcher from "./dispatcher";

export default class World {
  componentsLists: Map<string, Map<string, ComponentType>>;
  systemsList: Map<string, SystemType | SystemsGroupType>;
  mapData:
    | { mapSchema: MapSchema; mapFile: string; indexFile: string }
    | undefined;

  private worldName: string;
  constructor(name: string) {
    this.componentsLists = new Map();
    this.generateComponentLists();
    this.systemsList = new Map();
    this.mapData = undefined;
    this.worldName = name;
  }
  addSystem(system: keyof AvalibleSystems) {
    const createdSystem = new avalibleSystems[
      system as keyof AvalibleSystems | "CoreSystem"
    ]({
      name: this.worldName,
    } as SystemProps);
    this.systemsList.set(createdSystem.constructor.name, createdSystem);
  }
  addSystemsGroup(systemsGroup: keyof AvalibleSystemsGroups) {
    const createdSystemsGroup = new avalibleSystemsGroups[
      systemsGroup as keyof AvalibleSystemsGroups | "CoreGroupSystem"
    ]({
      name: this.worldName,
    });
    this.systemsList.set(
      createdSystemsGroup.constructor.name,
      createdSystemsGroup
    );
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
  addWorldMap(mapData: MapSchema, mapFileName: string, mapIndexName: string) {
    this.mapData = {
      mapSchema: mapData,
      indexFile: mapIndexName,
      mapFile: mapFileName,
    };
  }
  addEntity(entity: EntityType) {
    entity.world = this.worldName;
    entity.distributeComponents();
    Engine.globalContext.set("test", entity.id);
  }
  addActions() {
    //todo
  }
  private generateComponentLists() {
    Object.keys(avalibleComponents).forEach((component) => {
      this.componentsLists.set(component, new Map());
    });
  }
}
