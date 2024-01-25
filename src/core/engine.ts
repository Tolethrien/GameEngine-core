import World from "./ecs/world";
import { ActionsControllerType } from "./ecs/actions";
import Time from "./utils/timers/time";
import Aurora from "./aurora/auroraCore";
import "../css/index.css";
import DebugFrame from "./debugger/renderStats/renderFrame";
import Dispatcher from "./ecs/dispatcher";
import InputManager from "./modules/inputManager";
export const canvas = document.getElementById(
  "gameWindow"
) as HTMLCanvasElement;
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

interface EngineConfig {
  // core: "2d" | "3d"
  //   renderer: "Aurora";
  preload: () => Promise<unknown>;
  setup: () => void;
}

export default class Engine {
  private static isInitialized = false;
  public static worlds: Map<string, WorldType> = new Map();
  public static activeWorld = "main";
  public static actions: ActionsControllerType | undefined = undefined;
  public static globalContext: Map<string, unknown> = new Map();
  public static time: Time = new Time();
  public static async Initialize({ preload, setup }: EngineConfig) {
    if (Engine.isInitialized)
      throw new Error(
        "Engine already Initialize,you can only have one instance of engine"
      );
    await Aurora.initialize(canvas); // needs to be before preload
    await preload();
    Engine.setFirstAuroraFrame();
    DebugFrame.Initialize();
    InputManager.initialize();

    Dispatcher.Initialize();
    setup();
    Engine.worlds.forEach((world) => world.onStart());
    Engine.isInitialized = true;
    Engine.loop();
  }
  private static loop() {
    Engine.time.calculateTimeStamp();
    DebugFrame.start();
    Dispatcher.dispatchComponents();
    Dispatcher.removeComponents();
    Engine.worlds.get(Engine.activeWorld)?.onUpdate();
    DebugFrame.stop();
    requestAnimationFrame(Engine.loop);
  }

  private static setFirstAuroraFrame() {
    const encoder = Aurora.device.createCommandEncoder();
    const commandPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: Aurora.context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: [0, 0, 0, 1],
        },
      ],
    });
    commandPass.end();
    Aurora.device.queue.submit([encoder.finish()]);
  }
  public static createWorld = (wordlName: string) => {
    Engine.worlds.set(wordlName, new World(wordlName));
    return Engine.worlds.get(wordlName)!;
  };
  public static addDynamicEntity = <T extends EntityType>(
    world: string,
    entity: T
  ) => {
    entity.world = world;
    return entity;
  };
  public static addActionsController = (controller: ActionsControllerType) => {
    Engine.actions = controller;
    Engine.actions?.onStart();
  };
}
