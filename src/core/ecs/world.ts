import { avalibleSystems, avalibleSystemsGroups } from "../../sandbox/ECSList";

export default class World {
  componentsLists: Map<string, Map<string, ComponentType>>;
  systemsList: Map<string, SystemType | SystemsGroupType>;
  mapData: object | undefined;

  private worldName: string;
  constructor(name: string) {
    this.componentsLists = new Map();
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
  addWorldMap(map: object) {
    this.mapData = map;
  }
  addEntity(entity: EntityType) {
    entity.world = this.worldName;
    entity.distributeComponents();
  }
  addActions() {
    //todo
  }
}
