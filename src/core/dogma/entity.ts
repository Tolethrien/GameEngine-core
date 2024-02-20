import { avalibleComponents } from "../../sandbox/ECSList";
export type EntityComponents = Map<keyof AvalibleComponents, ComponentType>;
export default abstract class Entity {
  id: string;
  tags: string[];
  components: EntityComponents;
  constructor() {
    this.id = crypto.randomUUID();
    this.tags = [];
    this.components = new Map();
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
  addTag(tag: string) {
    if (!this.tags.includes(tag)) this.tags.push(tag);
  }
}
