import Engine from "../engine";
import { nameToUpper } from "../utils/utils";
export interface UseProps {
  entityId: string;
  [key: string]: unknown;
}
export abstract class Actions {
  worldName: string;
  constructor(world: string | "current") {
    this.worldName = world === "current" ? Engine.activeWorld : world;
  }
  abstract useAction(props: UseProps): void;
  abstract onStart(): void;
  getComponents<T = ComponentType>(
    component: Uncapitalize<keyof AvalibleComponents>
  ) {
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
      throw new Error(
        `Action: ${this.constructor.name} is trying to get list ${component} but this type of list is not exist in avalible Components.\r\nSee if you added it when creating system or create Actions in right order`
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
    throw new Error(
      `Action: ${this.constructor.name} is trying to get list ${component} but this type of list is not exist in avalible Components `
    );
  }
}
interface ActionsType extends Actions {}
export interface ActionsControllerType extends ActionsController {}
export abstract class ActionsController {
  actions: Map<string, ActionsType>;
  constructor() {
    this.actions = new Map();
  }
  addAction(action: ActionsType) {
    this.actions.set(action.constructor.name, action);
  }
  onStart() {
    this.actions.forEach((action) => action.onStart());
  }
  getAction(name: string) {
    if (!this.actions.has(name))
      throw new Error("trying to get or use action that doesn't exist");
    return this.actions.get(name)!;
  }
}
export const useAction = (name: string, props?: UseProps) => {
  if (!Engine.actions)
    throw new Error(
      "You try to use Actions, but there are no action controller asigned to Engine"
    );
  Engine.actions!.getAction(name).useAction(props ?? ({} as UseProps));
};
