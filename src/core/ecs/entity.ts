import { avalibleComponents } from "./ECSList";
import { nameToUpper } from "../../utils/helpers";
import Engine from "../engine";
type EntitiesManipulatedInFrame = { added: string[]; removed: string[] };
export default abstract class Entity {
  id: string;
  tags: string[];
  components: Map<string, ComponentType>;
  world: string;
  constructor(worldName?: string) {
    this.id = crypto.randomUUID();
    this.tags = [];
    this.components = new Map();
    this.world = worldName ?? "";
  }
  addComponent<T = unknown>(component: Uncapitalize<keyof AvalibleComponents>, props?: T) {
    this.components.set(
      component,
      new avalibleComponents[nameToUpper(component)](
        { entityID: this.id, entityTags: this.tags },
        props ?? {}
      )
    );
  }
  distributeComponents() {
    const world = Engine.worlds.get(this.world);
    if (world) {
      Entity.setManipulatedEntities("add", this.id);
      this.components.forEach((component, componentName) => {
        if (world.componentsLists.has(nameToUpper(componentName)))
          world.componentsLists.get(nameToUpper(componentName))?.set(this.id, component);
        else
          world.componentsLists.set(nameToUpper(componentName), new Map().set(this.id, component));
      });
    } else throw new Error(`cannot distribute components to world "${this.world}`);
  }
  deleteComponents() {
    const world = Engine.worlds.get(this.world);
    if (world) {
      Entity.setManipulatedEntities("remove", this.id);

      world.componentsLists.forEach((list) => {
        if (list.has(this.id)) list.delete(this.id);
      });
    } else throw new Error(`cannot find world "${this.world} or components to remove`);
  }
  addTag(tag: string) {
    if (!this.tags.includes(tag)) this.tags.push(tag);
  }
  private static setManipulatedEntities(status: "remove" | "add", entityId: string) {
    if (status === "add")
      (
        Engine.globalContext.get("EntitiesManipulatedInFrame")! as EntitiesManipulatedInFrame
      ).added.push(entityId);
    else
      (
        Engine.globalContext.get("EntitiesManipulatedInFrame")! as EntitiesManipulatedInFrame
      ).removed.push(entityId);
  }
}
