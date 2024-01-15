import { avalibleComponents } from "../../sandbox/ECSList";
import Engine from "../engine";

export type DispatcherConnectionType = "added" | "removed" | "both";
export default class Dispatcher {
  private static componentsToDispatch: Map<
    keyof AvalibleComponents,
    ComponentType[]
  >;
  private static componentsToRemoval: Set<string>;
  public static manipulatedInFrameList = {
    added: new Set() as Set<string>,
    removed: new Set() as Set<string>,
  };

  public static Initialize() {
    this.componentsToDispatch = this.createComponentsStorage();
    this.componentsToRemoval = new Set() as Set<string>;
  }

  private static createComponentsStorage() {
    const storage = new Map() as Map<keyof AvalibleComponents, ComponentType[]>;
    Object.keys(avalibleComponents).forEach((component) =>
      storage.set(component as keyof AvalibleComponents, [])
    );
    return storage;
  }

  public static distributeEntity(
    components: Map<keyof AvalibleComponents, ComponentType>
  ) {
    components.forEach((component, name) =>
      this.componentsToDispatch.get(name)?.push(component)
    );
  }
  public static removeEntity(entityID: string) {
    this.componentsToRemoval.add(entityID);
  }
  public static dispatchComponents() {
    this.manipulatedInFrameList.added.clear();
    Engine.worlds
      .get(Engine.activeWorld)
      ?.componentsLists.forEach((allComponents, allName) => {
        this.componentsToDispatch
          .get(allName as keyof AvalibleComponents)
          ?.forEach((dispatchComponent) => {
            allComponents.set(dispatchComponent.entityID, dispatchComponent);
            this.manipulatedInFrameList.added.add(dispatchComponent.entityID);
          });
        this.componentsToDispatch.get(
          allName as keyof AvalibleComponents
        )!.length = 0;
      });
  }
  public static removeComponents() {
    this.manipulatedInFrameList.removed.clear();
    this.componentsToRemoval.forEach((entityID) =>
      Engine.worlds
        .get(Engine.activeWorld)
        ?.componentsLists.forEach((component) => {
          component.delete(entityID);
          this.manipulatedInFrameList.removed.add(entityID);
          this.componentsToRemoval.delete(entityID);
        })
    );
    // this.componentsToRemoval.clear();
  }
}
