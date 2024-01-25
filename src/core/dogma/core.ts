import { avalibleComponents } from "../../sandbox/ECSList";
type World = Map<string, Map<string, ComponentType>>;
/**DOGMA - Data Oriented Game Mechanics Architecture */
export default class DogmaCore {
  private static worlds: Map<string, World> = new Map();
  private static activeWorld: World;
  private static activeWorldName: string;

  public static createWorld = (wordlName: string) => {
    const world: World = new Map();
    Object.keys(avalibleComponents).forEach((component) => {
      world.set(component, new Map());
    });
    console.log("str");
    this.worlds.set(wordlName, world);
  };
  public static set setActiveWorld(wordlName: string) {
    if (!this.worlds.has(wordlName))
      throw new Error(`DOGMA: world ${wordlName} does not exist!`);
    this.activeWorld = this.worlds.get(wordlName)!;
    this.activeWorldName = wordlName;
  }
  public static get getActiveWorld() {
    return this.activeWorld;
  }
  public static get getActiveWorldName() {
    return this.activeWorldName;
  }
}
