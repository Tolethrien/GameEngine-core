// import Aurora from "../../aurora/auroraCore";
// import Time from "../time";
// import { ActionsControllerType } from "./actions";
// import World from "./world";

// export const canvas = document.getElementById("gameWindow") as HTMLCanvasElement;
// const messureTime = document.getElementById("fps-output");
// messureTime!.innerText = String(0);
// let mod = 0;

// interface EngineConfig {
//   // core: "2d" | "3d"
//   //   renderer: "Aurora";
//   preload: () => Promise<unknown>;
//   setup: () => void;
// }
// export default class Engine {
//   private static engineInit = false;
//   public static worlds: Map<string, WorldType> = new Map();
//   public static activeWorld = "main";
//   public static actions: ActionsControllerType | undefined = undefined;
//   public static globalContext: Map<string, unknown> = Engine.createGlobalContext();
//   private static time: Time = new Time();
//   private static meter: FPSM;

//   public static async Initialize({ preload, setup }: EngineConfig) {
//     if (Engine.engineInit)
//       throw new Error("Engine already Initialize,you can only have one instance of engine");
//     await Aurora.initialize(canvas); // needs to be before preload
//     await preload();
//     setup();
//     Engine.meter = new FPSMeter();
//     Engine.worlds.forEach((world) => world.onStart());
//     Engine.engineInit = true;
//     this.loop();
//   }
//   private static loop() {
//     Engine.time.calculateTimeStamp();
//     const x = performance.now();
//     Engine.worlds.get(Engine.activeWorld)!.onUpdate();
//     Engine.globalContext.set("EntitiesManipulatedInFrame", { added: [], removed: [] });
//     Engine.meter.tick();
//     Engine.tick(x);

//     requestAnimationFrame(Engine.loop);
//   }
//   private static createGlobalContext() {
//     const data: [string, unknown][] = [["EntitiesManipulatedInFrame", { added: [], removed: [] }]];
//     return new Map<string, unknown>(data);
//   }
//   private static tick = (x: number) => {
//     mod % 15 === 0 && mod !== 0
//       ? ((messureTime!.innerText = `${(performance.now() - x).toFixed(2)}MS`), (mod = 0))
//       : mod++;
//   };
//   public static createWorld = (wordlName: string) => {
//     Engine.worlds.set(wordlName, new World(wordlName));
//     return Engine.worlds.get(wordlName)!;
//   };
//   public static addDynamicEntity = <T extends EntityType>(world: string, entity: T) => {
//     entity.world = world;
//     return entity;
//   };
//   public static addActionsController = (controller: ActionsControllerType) => {
//     Engine.actions = controller;
//     Engine.actions?.onStart();
//   };
// }
