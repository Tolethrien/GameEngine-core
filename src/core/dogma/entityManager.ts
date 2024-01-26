import { avalibleComponents } from "../../sandbox/ECSList";
import Entity from "../ecs/entity";
import DogmaCore, { Worlds } from "./core";
import World from "./world";
type CompDispatch = Map<keyof AvalibleComponents, ComponentType[]>;
type CompRemoval = Set<string>;
type Manipulated = { added: Set<string>; removed: Set<string> };
export default class EntityManager {
  private static worlds: Worlds;
  private static activeWorld: World;
  private static isInitialize = false;
  private static componentsToDispatch: CompDispatch;
  private static componentsToRemoval: CompRemoval = new Set();
  public static manipulatedInFrameList: Manipulated = {
    added: new Set(),
    removed: new Set(),
  };
  public static addEntityOnStart(entity: EntityType) {
    entity.components.forEach((component, componentName) => {
      this.activeWorld.getComponents
        .get(componentName)
        ?.set(entity.id, component);
    });
  }
  public static addEntityOnLoop(entity: EntityType) {
    entity.components.forEach((component, name) =>
      this.componentsToDispatch.get(name)?.push(component)
    );
  }
  public static removeEntity(entityID: Entity["id"]) {
    this.componentsToRemoval.add(entityID);
  }
  public static transferEntitiesToAnatherWorld(list: Entity["id"][]) {
    //TODO: entities transfer between worlds
  }
  public static connectToNewWorld() {
    this.worlds = DogmaCore.getAllWorlds;
    this.activeWorld = DogmaCore.getActiveWorld;
  }
  public static dispatchComponents() {
    this.manipulatedInFrameList.added.clear();
    this.componentsToDispatch.forEach((componentList, componentName) => {
      const worldList = this.activeWorld.getComponents.get(componentName)!;
      componentList.forEach((component) => {
        worldList.set(component.entityID, component);
        this.manipulatedInFrameList.added.add(component.entityID);
      });
      componentList.length = 0;
    });
  }

  public static removeComponents() {
    this.manipulatedInFrameList.removed.clear();
    this.componentsToRemoval.forEach((entityID) =>
      this.activeWorld.getComponents.forEach((componentList) => {
        componentList.delete(entityID);
        this.manipulatedInFrameList.removed.add(entityID);
        this.componentsToRemoval.delete(entityID);
      })
    );
  }
  private static createComponentsStorage() {
    const storage = new Map() as Map<keyof AvalibleComponents, ComponentType[]>;
    Object.keys(avalibleComponents).forEach((component) =>
      storage.set(component as keyof AvalibleComponents, [])
    );
    return storage;
  }
  public static get isManagerInitialize() {
    return this.isInitialize;
  }
  public static get getManipulatedLastFrame() {
    return this.manipulatedInFrameList;
  }
  public static initialize() {
    this.componentsToDispatch = this.createComponentsStorage();
    this.isInitialize = true;
  }
}
