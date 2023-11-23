import { avalibleSystems, avalibleSystemsGroups } from "../../sandbox/ECSList";
import { nameToUpper } from "../utils/utils";

export default class World {
  componentsLists: Map<string, Map<string, ComponentType>>;
  systemsList: Map<string, SystemType>;
  mapData: object | undefined;

  private worldName: string;
  constructor(name: string) {
    this.componentsLists = new Map();
    this.systemsList = new Map();
    this.mapData = undefined;
    this.worldName = name;
  }
  addSystem(system: Uncapitalize<keyof avalibleSystems>) {
    const createdSystem = new avalibleSystems[
      nameToUpper(system as keyof avalibleSystems)
    ]({
      name: this.worldName,
    } as SystemProps);
    this.systemsList.set(createdSystem.constructor.name, createdSystem);
  }
  addSystemsGroup(systemsGroup: Uncapitalize<keyof avalibleSystemsGroups>) {
    const createdSystemsGroup = new avalibleSystemsGroups[
      nameToUpper(systemsGroup as keyof avalibleSystemsGroups)
    ]({ name: this.worldName });
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
  addWorldMap(map: object) {
    this.mapData = map;
    // new MapECS(map, this.worldChunks, this.worldName);
  }
  addEntity(entity: EntityType) {
    entity.world = this.worldName;
    entity.distributeComponents();
  }
  addActions() {}
}
