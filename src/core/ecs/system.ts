import Engine from "../engine";
import { nameToUpper } from "../utils/utils";
import World from "./world";
type EntitiesManipulatedInFrame = { added: string[]; removed: string[] };

export default abstract class System {
  protected worldName: string;
  private shared?: Map<string, unknown>;
  constructor(props: SystemProps) {
    this.worldName = props.name;
    this.shared = props.shared;
  }
  onStart() {}
  onUpdate() {}
  getComponents<T = ComponentType>(
    component: Uncapitalize<keyof AvalibleComponents>
  ) {
    //TODO: get component jesli nie znajdzie tej listy wywala error ale jest szansa ze lista powstanie pozniej niz na stworzeniu gry
    // jesli obiekt z dana lista zostanie dodany pozniej, dynamicznie, ale system dalej bedzie wymagal na poczatku programu by
    // ta lista istniała
    if (
      Engine.worlds.has(this.worldName) &&
      Engine.worlds
        .get(this.worldName)!
        .componentsLists.has(nameToUpper(component))
    ) {
      return Engine.worlds
        .get(this.worldName)!
        .componentsLists.get(nameToUpper(component)) as T;
    } else
      throw new ReferenceError(
        `${this.constructor.name} is trying to get list ${component} but this type of list is not exist in avalible Components.\r\nSee if you added it when creating system `
      );
  }

  getEntityComponentByTag<T = ComponentType>(
    component: Uncapitalize<keyof AvalibleComponents>,
    tag: string
  ) {
    if (
      Engine.worlds.has(this.worldName) &&
      Engine.worlds
        .get(this.worldName)
        ?.componentsLists.has(nameToUpper(component))
    ) {
      const entityFound = Array.from(
        Engine.worlds
          .get(this.worldName)!
          .componentsLists.get(nameToUpper(component))!
          .values()
      ).find((element) => element.entityTags.includes(tag));
      if (entityFound) return entityFound as T;
    }
    throw new ReferenceError(
      `${this.constructor.name} is trying to get list ${component} but this type of list is not exist in avalible Components `
    );
  }
  getEntityComponentByID() {}
  getEntitiesManipulatedInFrame() {
    return Engine.globalContext.get("EntitiesManipulatedInFrame") as {
      added: string[];
      removed: string[];
    };
  }
  getMapChunks() {
    if (Engine.worlds.has(this.worldName))
      return Engine.worlds.get(this.worldName)!.worldChunks;
    else
      throw new ReferenceError(
        `${this.constructor.name} trying to get all Chunks from the world ${this.worldName} but they are undefined`
      );
  }
  getMapData() {
    if (!Engine.worlds.has(this.worldName))
      throw new ReferenceError(
        `${this.constructor.name} trying to get mapData from the world ${this.worldName} but they are undefined`
      );
    return Engine.worlds.get(this.worldName)!.mapData;
  }
  getLoadedChunks() {
    if (Engine.worlds.has(this.worldName))
      return Engine.worlds.get(this.worldName)!.loadedChunks;
    else
      throw new ReferenceError(
        `${this.constructor.name} trying to get loaded Chunks from the world ${this.worldName} but they are undefined`
      );
  }

  globalContext(
    action: "set" | "delete" | "get",
    name: string,
    value?: unknown
  ) {
    switch (action) {
      case "set":
        Engine.globalContext.set(name, value);
        break;
      case "delete":
        Engine.globalContext.delete(name);
        break;
      case "get":
        return Engine.globalContext.get(name);
      default:
        console.error(
          `global Context Error in ${this.constructor.name} System: ${action} is not valid action type `
        );
    }
    return;
  }
  sharedState(action: "set" | "delete" | "get", name: string, data?: unknown) {
    if (!this.shared)
      throw new Error("sharing data is avalible only in SystemGroups");
    switch (action) {
      case "set":
        this.shared.set(name, data);
        break;
      case "delete":
        this.shared.delete(name);
        break;
      case "get":
        return this.shared.get(name);
      default:
        console.error(
          `Shared Data Error in ${this.constructor.name} System: ${action} is not valid action type `
        );
    }
    return;
  }
  deleteEntity(id: EntityType["id"]) {
    const world = Engine.worlds.get(this.worldName);
    if (world) {
      System.setManipulatedEntities("remove", id);

      world.componentsLists.forEach((list) => {
        if (list.has(id)) list.delete(id);
      });
    } else
      throw new Error(
        `cannot find world "${this.worldName} or components to remove`
      );
  }
  private static setManipulatedEntities(
    status: "remove" | "add",
    entityId: string
  ) {
    if (status === "add")
      (
        Engine.globalContext.get(
          "EntitiesManipulatedInFrame"
        )! as EntitiesManipulatedInFrame
      ).added.push(entityId);
    else
      (
        Engine.globalContext.get(
          "EntitiesManipulatedInFrame"
        )! as EntitiesManipulatedInFrame
      ).removed.push(entityId);
  }
}
