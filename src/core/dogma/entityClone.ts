import { EntityComponents } from "./entity";
//TODO: dodac manipulowanie komponentami
export default class EntityClone {
  private clonedComponents: EntityComponents;
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
}
