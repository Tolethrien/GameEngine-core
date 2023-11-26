import Engine from "../engine";

export default abstract class System {
  protected worldName: string;
  private shared?: Map<string, unknown>;
  constructor(props: SystemProps) {
    this.worldName = props.name;
    this.shared = props.shared;
  }
  onStart() {
    // ready to override
  }
  onUpdate() {
    //ready to override
  }
  getComponents<T = ComponentType>(component: keyof AvalibleComponents) {
    if (
      Engine.worlds.has(this.worldName) &&
      Engine.worlds.get(this.worldName)!.componentsLists.has(component)
    ) {
      return Engine.worlds
        .get(this.worldName)!
        .componentsLists.get(component) as T;
    } else
      throw console.warn(
        `${this.constructor.name} is trying to get list ${component} but this type of list is not exist in avalible Components.\r\nSee if you added it when creating system or ake sure it will be created before accesing `
      );
  }

  getEntityComponentByTag<T = ComponentType>(
    component: keyof AvalibleComponents,
    tag: string
  ) {
    if (
      Engine.worlds.has(this.worldName) &&
      Engine.worlds.get(this.worldName)?.componentsLists.has(component)
    ) {
      const entityFound = Array.from(
        Engine.worlds
          .get(this.worldName)!
          .componentsLists.get(component)!
          .values()
      ).find((element) => element.entityTags.includes(tag));
      if (entityFound) return entityFound as T;
    }
    throw new ReferenceError(
      `${this.constructor.name} is trying to get list ${component} but this type of list is not exist in avalible Components `
    );
  }
  // getEntityComponentByID() {}
  getEntitiesManipulatedInFrame() {
    return Engine.globalContext.get("EntitiesManipulatedInFrame") as {
      added: string[];
      removed: string[];
    };
  }

  getMapData() {
    if (!Engine.worlds.has(this.worldName))
      throw new ReferenceError(
        `${this.constructor.name} trying to get mapData from the world ${this.worldName} but they are undefined`
      );
    return Engine.worlds.get(this.worldName)!.mapData;
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
