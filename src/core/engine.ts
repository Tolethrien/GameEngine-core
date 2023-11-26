import World from "./ecs/world";
import { ActionsControllerType } from "./ecs/actions";
import Time from "./utils/timers/time";
import Aurora from "./aurora/auroraCore";
import "../css/index.css";
import AuroraBatcher from "./aurora/auroraBatcher";
import DebugFrame from "./debugger/renderStats/renderFrame";
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
  preload: () => Promise<unknown>;
  setup: () => void;
}

export default class Engine {
  private static isInitialized = false;
  public static worlds: Map<string, WorldType> = new Map();
  public static activeWorld = "main";
  public static actions: ActionsControllerType | undefined = undefined;
  public static globalContext: Map<string, unknown> =
    Engine.createGlobalContext();
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
    Engine.setGlobalContexts();
    Engine.addGlobalListeners();
    setup();
    Engine.worlds.forEach((world) => world.onStart());
    Engine.isInitialized = true;
    Engine.loop();
  }
  private static loop() {
    Engine.time.calculateTimeStamp();
    DebugFrame.start();
    Engine.worlds.get(Engine.activeWorld)?.onUpdate();
    Engine.clearOnFrame();
    // DebugFrame.tick(
    //   Engine.time.now,
    //   Engine.time.getSeconds,
    //   AuroraBatcher.numberOfQuadsInBatch
    // );
    DebugFrame.stop();
    requestAnimationFrame(Engine.loop);
  }
  private static createGlobalContext() {
    const data: [string, unknown][] = [
      ["EntitiesManipulatedInFrame", { added: [], removed: [] }],
    ];
    return new Map<string, unknown>(data);
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
    Engine.globalContext.set("EntitiesManipulatedInFrame", {
      added: [],
      removed: [],
    });
    Engine.globalContext.set("mousePosition", { x: 0, y: 0 });
    Engine.globalContext.set("mousePressed", false);
  }
  private static clearOnFrame() {
    Engine.globalContext.set("EntitiesManipulatedInFrame", {
      added: [],
      removed: [],
    });
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
