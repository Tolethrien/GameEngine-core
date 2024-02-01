import { avalibleSystems } from "../../sandbox/ECSList";
import EntityManager from "./entityManager";
import World, { WorldType } from "./world";
/**DOGMA - Data Oriented Game Mechanics Architecture */
export type Worlds = Map<string, WorldType>;
export default class DogmaCore {
  private static worlds: Worlds = new Map();
  private static activeWorld: WorldType;
  private static activeWorldName: string;
  private static systems: Map<string, SystemType> = new Map();
  private static startOnlySystems: Set<keyof AvalibleSystems> = new Set();

  public static createWorld = (wordlName: string) => {
    this.worlds.set(wordlName, new World(wordlName));
    this.activeWorld = this.worlds.get(wordlName)!;
    this.activeWorldName = wordlName;
    if (!EntityManager.isManagerInitialize) EntityManager.initialize();
    EntityManager.connectToNewWorld();
  };
  public static set setActiveWorld(wordlName: string) {
    if (!this.worlds.has(wordlName))
      throw new Error(`DOGMA: world ${wordlName} does not exist!`);
    this.activeWorld = this.worlds.get(wordlName)!;
    this.activeWorldName = wordlName;
    EntityManager.connectToNewWorld();
    this.systems.forEach((system) => {
      system.onSubscribeList();
      system.isSystemFullReload && system.onStart();
    });
  }
  public static get getAllWorlds() {
    return this.worlds;
  }
  public static get getActiveWorld() {
    return this.activeWorld;
  }
  public static get getActiveWorldName() {
    return this.activeWorldName;
  }
  public static addSystem(system: keyof AvalibleSystems, startOnly?: boolean) {
    const createdSystem = new avalibleSystems[system]();
    this.systems.set(system, createdSystem);
    startOnly && this.startOnlySystems.add(system);
  }

  public static setSystemActive(
    system: keyof AvalibleSystems,
    active: boolean
  ) {
    this.systems.get(system)!.setSystemActive = active;
  }
  public static addWorldMap(
    mapData: MapSchema,
    mapFileName: string,
    mapIndexName: string
  ) {
    //TODO: dodac nowy system dodawania mapy uzywajacy jednego pliku
    this.activeWorld.setMapData = {
      mapSchema: mapData,
      indexFile: mapIndexName,
      mapFile: mapFileName,
    };
  }
  public static systemsOnStart() {
    if (!this.activeWorld) return;
    this.systems.forEach((system) => system.onSubscribeList());
    this.systems.forEach((system) => {
      const systemName = system.constructor.name as keyof AvalibleSystems;
      system.onStart();
      this.startOnlySystems.has(systemName) && this.systems.delete(systemName);
    });
  }
  public static systemsOnUpdate() {
    if (!this.activeWorld) return;
    EntityManager.dispatchComponents();
    EntityManager.removeComponents();
    this.systems.forEach((system) => {
      system.isSystemActive && system.onUpdate();
    });
  }

  public static systemsOnListCreation() {
    if (!this.activeWorld) return;
  }
}
