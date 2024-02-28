export default class EntityClone {
  private clonedComponents: Map<keyof AvalibleComponents, ComponentType>;
  id: EntityType["id"];
  constructor(ID: EntityType["id"]) {
    this.clonedComponents = new Map();
    this.id = ID;
  }
  public get components() {
    return this.clonedComponents;
  }
  public addComponent(component: ComponentType) {
    this.clonedComponents.set(
      component.constructor.name as keyof AvalibleComponents,
      component
    );
  }
  public removeComponent(component: keyof AvalibleComponents) {
    this.clonedComponents.delete(component);
  }

  public getComponent<T = ComponentType>(component: keyof AvalibleComponents) {
    return this.clonedComponents.get(component) as T;
  }
}
