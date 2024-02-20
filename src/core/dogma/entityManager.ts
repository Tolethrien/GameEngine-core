import { avalibleComponents } from "../../sandbox/ECSList";
import DogmaCore, { Worlds } from "./core";
import EntityClone from "./entityClone";
import World from "./world";
type CompDispatch = Map<keyof AvalibleComponents, ComponentType[]>;
type CompRemoval = Set<string>;
type Manipulated = { added: Set<string>; removed: Set<string> };
export default class EntityManager {
  //TODO: po uja mi tutaj worlds i activeworld skoro po prostu moge zrobic get z Coru?
  //mozesz po prostu miec geter kierujacy cie do coru

  //TODO: zrobic rekonstruowanie entity z komponentow ewentualnie jakis system trzymania kompnentow w obiekcie
  //incapsulated entity, wszystkie jego komponenty, mozliwosc zmanipulowania nich a potem dodania na nowo do swiata
  private static worlds: Worlds;
  private static activeWorld: World;
  private static isInitialize = false;
  private static componentsToDispatch: CompDispatch;
  private static componentsToRemoval: CompRemoval = new Set();
  public static manipulatedInFrameList: Manipulated = {
    added: new Set(),
    removed: new Set(),
  };
  public static addEntityOnStart(entity: EntityType | EntityClone) {
    entity.components.forEach((component, componentName) => {
      this.activeWorld.getComponents
        .get(componentName)
        ?.set(entity.id, component);
    });
  }
  public static addEntityOnLoop(entity: EntityType | EntityClone) {
    entity.components.forEach((component, name) =>
      this.componentsToDispatch.get(name)?.push(component)
    );
  }
  public static removeEntity(entityID: EntityType["id"]) {
    this.componentsToRemoval.add(entityID);
  }
  public static transferEntitiesToAnatherWorld(list: EntityType["id"][]) {
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
  public static cloneEntity(ID: EntityType["id"]) {
    const ent = new EntityClone(ID);
    this.activeWorld.getComponents.forEach((component) => {
      component.has(ID) && ent.addComponent(component.get(ID)!);
    });
    if (ent.components.size === 0)
      console.warn("trying to clone empty Entity or Entity doesn't Exists");
    return ent;
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
