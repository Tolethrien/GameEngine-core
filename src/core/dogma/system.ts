import DogmaCore from "./core";

export default abstract class System {
  private active: boolean;
  private systemFullReload: boolean;
  constructor() {
    this.active = true;
    this.systemFullReload = false;
  }
  onStart(): void {
    //method to work ones on the beginning
  }
  onUpdate(): void {
    //method to work every frame
  }
  onSubscribeList(): void {
    //method to work ones on the beginning, subscribe to world to get new data on every world change
  }

  public get isSystemActive() {
    return this.active;
  }
  public set setSystemActive(active: boolean) {
    this.active = active;
  }
  getComponents<T = ComponentType>(component: keyof AvalibleComponents) {
    return DogmaCore.getActiveWorld.getComponents.get(component) as T;
  }
  getEntityComponentByTag<T = ComponentType>(
    component: keyof AvalibleComponents,
    tag: string
  ) {
    const entityFound = Array.from(
      DogmaCore.getActiveWorld.getComponents.get(component)!.values()
    ).find((element) => element.entityTags.includes(tag));
    if (!entityFound)
      console.warn(`there is no component: ${component} with tag of ${tag}`);
    return entityFound as T;
  }
  get getMapData() {
    return DogmaCore.getActiveWorld.getMapData;
  }
  get isSystemFullReload() {
    return this.systemFullReload;
  }
  set setSystemFullReload(bool: boolean) {
    this.systemFullReload = bool;
  }
}
