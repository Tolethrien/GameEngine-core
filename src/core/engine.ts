import World from "./ecs/world";
import { ActionsControllerType } from "./ecs/actions";
import Time from "./utils/timers/time";
import Aurora from "./aurora/auroraCore";
import "../css/index.css";
import DebugFrame from "./debugger/renderStats/renderFrame";
import Dispatcher from "./ecs/dispatcher";
export const canvas = document.getElementById(
  "gameWindow"
) as HTMLCanvasElement;

export const filesObjects: Map<
  string,
  HTMLImageElement | HTMLAudioElement | OffscreenCanvas
> = new Map();

interface EngineConfig {
  // core: "2d" | "3d"
  //   renderer: "Aurora";
  recordEntityChangedOnFrame?: boolean;
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
  public static entityIsRecorder: boolean;
  public static async Initialize({
    preload,
    setup,
    recordEntityChangedOnFrame = false,
  }: EngineConfig) {
    if (Engine.isInitialized)
      throw new Error(
        "Engine already Initialize,you can only have one instance of engine"
      );
    await Aurora.initialize(canvas); // needs to be before preload
    await preload();
    Engine.entityIsRecorder = recordEntityChangedOnFrame;
    Engine.setFirstAuroraFrame();
    DebugFrame.Initialize();
    Engine.setGlobalContexts();
    Engine.addGlobalListeners();
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
  private static setGlobalContexts() {
    Engine.globalContext.set("mousePosition", { x: 0, y: 0 });
    Engine.globalContext.set("mousePressed", false);
    if (Engine.entityIsRecorder) {
      Engine.globalContext.set(
        "entityLastAdded",
        new Set() as RecorderEntities
      );
      Engine.globalContext.set(
        "entityLastRemoved",
        new Set() as RecorderEntities
      );
    }
  }

  private static addGlobalListeners() {
    canvas.onmousedown = () => {
      Engine.globalContext.set("mousePressed", true);
    };
    canvas.onmouseup = () => {
      Engine.globalContext.set("mousePressed", false);
    };
    canvas.addEventListener("mousemove", (event) => {
      Engine.globalContext.set("mousePosition", {
        x: event.offsetX,
        y: event.offsetY,
      });
    });
  }
}
