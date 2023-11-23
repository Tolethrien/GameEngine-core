import { avalibleSystems } from "src/sandbox/ECSList";
import { nameToUpper } from "../utils/utils";

export default abstract class SystemsGroup {
  /**
   * TODO: przerobic shared state na sygnały
   */
  shared: Map<string, unknown>;
  worldName: string;
  systemsList: Map<string, SystemType>;
  constructor(props: SystemProps) {
    this.shared = new Map();
    this.worldName = props.name;
    this.systemsList = new Map();
  }
  addSystem(system: Uncapitalize<keyof avalibleSystems>) {
    const createdSystem = new avalibleSystems[
      nameToUpper(system as keyof avalibleSystems)
    ]({
      name: this.worldName,
      shared: this.shared,
    } as SystemProps);
    this.systemsList.set(createdSystem.constructor.name, createdSystem);
  }
  removeSystem(name: string) {
    this.systemsList.delete(name);
  }
  onStart() {
    this.systemsList.forEach((system) => system.onStart());
  }
  onUpdate() {
    this.systemsList.forEach((system) => system.onUpdate());
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
}
