import Time from "./utils/timers/time";
import Aurora from "./aurora/auroraCore";
import "../css/index.css";
import DebugFrame from "./debugger/renderStats/renderFrame";
import InputManager from "./modules/inputManager/inputManager";
import DogmaCore from "./dogma/core";
export const canvas = document.getElementById(
  "gameWindow"
) as HTMLCanvasElement;
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

interface EngineConfig {
  preload: () => Promise<unknown>;
  setup: () => void;
}

export default class Engine {
  private static isInitialized = false;
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
    setup();
    DogmaCore.systemsOnListCreation();
    DogmaCore.systemsOnStart();
    Engine.isInitialized = true;
    Engine.loop();
  }
  private static loop() {
    Engine.time.calculateTimeStamp();
    DebugFrame.start();
    DogmaCore.systemsOnUpdate();
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
}
