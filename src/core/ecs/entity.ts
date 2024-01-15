import { avalibleComponents } from "../../sandbox/ECSList";
import Engine from "../engine";
import Dispatcher from "./dispatcher";
// import { nameToUpper } from "../utils/utils";

export default abstract class Entity {
  id: string;
  tags: string[];
  components: Map<keyof AvalibleComponents, ComponentType>;
  world: string;
  constructor(worldName?: string) {
    this.id = crypto.randomUUID();
    this.tags = [];
    this.components = new Map();
    this.world = worldName ?? "";
  }
  addComponent<K extends keyof AvalibleComponents>(
    component: K,
    props?: ConstructorParameters<(typeof avalibleComponents)[K]>[1]
  ) {
    this.components.set(
      component,
      new avalibleComponents[component as K | "CoreComponent"](
        { entityID: this.id, entityTags: this.tags },
        // @ts-ignore
        props ?? {}
      )
    );
  }
  distributeComponents() {
    const world = Engine.worlds.get(this.world);
    if (world) {
      this.components.forEach((component, componentName) => {
        if (world.componentsLists.has(componentName))
          world.componentsLists.get(componentName)?.set(this.id, component);
        else
          throw new Error(
            `Invalid Component ${componentName}. Make sure is added to the ECS List`
          );
      });
    } else
      throw new Error(`cannot distribute components to world "${this.world}`);
  }
  deleteComponents() {
    const world = Engine.worlds.get(this.world);
    if (world) {
      world.componentsLists.forEach((list) => {
        if (list.has(this.id)) list.delete(this.id);
      });
    } else
      throw new Error(
        `cannot find world "${this.world} or components to remove`
      );
  }
  addTag(tag: string) {
    if (!this.tags.includes(tag)) this.tags.push(tag);
  }
  dispatchComponents() {
    Dispatcher.distributeEntity(this.components);
  }
  removeComponents() {
    Dispatcher.removeEntity(this.id);
  }
}
