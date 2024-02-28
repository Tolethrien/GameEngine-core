import { canvas } from "../../engine";
import Mat4 from "../../math/mat4";
export type MouseKey = "left" | "right" | "middle";
export type MouseOnEvent =
  | "leftClick"
  | "rightClick"
  | "dbClick"
  | "auxClick"
  | "wheelUp"
  | "wheelDown";
export type MouseCallbacks = Record<MouseOnEvent, (() => void) | undefined>;
const MOUSE_ENUM: Record<number, MouseKey> = {
  0: "left",
  1: "middle",
  2: "right",
};

export default class InputManager {
  private static mousePressed: Record<MouseKey, boolean> = {
    left: false,
    right: false,
    middle: false,
  };

  private static mouseCallbacks: MouseCallbacks = {
    leftClick: undefined,
    rightClick: undefined,
    auxClick: undefined,
    dbClick: undefined,
    wheelUp: undefined,
    wheelDown: undefined,
  };
  private static mousePositionOnCavas = { x: 0, y: 0 };
  private static keyPressed = new Set();

  public static initialize() {
    canvas.onmousedown = (event) => {
      this.mousePressed[MOUSE_ENUM[event.button]] = true;
    };
    canvas.onmouseup = (event) => {
      this.mousePressed[MOUSE_ENUM[event.button]] = false;
    };
    canvas.onmousemove = (event) => {
      this.mousePositionOnCavas = { x: event.offsetX, y: event.offsetY };
    };
    window.onkeydown = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      !event.repeat && this.keyPressed.add(pressedKey);
    };
    window.onkeyup = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      this.keyPressed.has(pressedKey) && this.keyPressed.delete(pressedKey);
    };
    //TODO: dodac pauzowanie wszystkiego kiedy lost focus
    // window.onblur = () => console.log("lost");

    // window.onresize = () => {
    //   canvas.width = window.innerWidth;
    //   canvas.height = window.innerHeight;
    // };
    // canvas.addEventListener("wheel", (event) => {
    //   this.globalContext("set", "mouseDelta", event.deltaY);
    //   if (this.clearScroll) {
    //     clearTimeout(this.clearScroll);
    //   }
    //   this.clearScroll = setTimeout(() => {
    //     this.globalContext("delete", "mouseDelta");
    //     this.clearScroll = null;
    //   }, 50);
    // });
  }
  public static set setOnResize(callback: () => void) {
    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      callback();
    };
  }
  public static setMouseCallbacks(callbacks: Partial<MouseCallbacks>) {
    this.mouseCallbacks = { ...this.mouseCallbacks, ...callbacks };
    canvas.onclick = () => this.mouseCallbacks.leftClick?.();
    canvas.onauxclick = (event) => {
      if (event.button === 2) this.mouseCallbacks.rightClick?.();
      else if (event.button === 1) this.mouseCallbacks.auxClick?.();
    };
    canvas.ondblclick = () => this.mouseCallbacks.dbClick?.();
    canvas.onwheel = (event) => {
      if (event.deltaY < 0) this.mouseCallbacks.wheelUp?.();
      if (event.deltaY > 0) this.mouseCallbacks.wheelDown?.();
    };
  }

  public static get getMousePosition() {
    return this.mousePositionOnCavas;
  }
  public static getTranslatedMousePosition(projectionViewMatrix: Mat4) {
    const mouseXNormalized =
      (this.mousePositionOnCavas.x / canvas.width) * 2 - 1;
    const mouseYNormalized =
      -(this.mousePositionOnCavas.y / canvas.height) * 2 + 1;
    const inverseMatrix = projectionViewMatrix.invert();
    const mouseWorldSpace = inverseMatrix.transform([
      mouseXNormalized,
      mouseYNormalized,
      -1,
      1,
    ]);
    return { x: mouseWorldSpace[0], y: mouseWorldSpace[1] };
  }
  public static convertPercentToPixels({
    size,
    position,
  }: {
    position: Position2D;
    size: Size2D;
  }) {
    return {
      position: {
        x: (position.x / 100) * canvas.width,
        y: (position.y / 100) * canvas.height,
      },
      size: {
        width: (size.width / 100) * canvas.width,
        height: (size.height / 100) * canvas.height,
      },
    };
  }
  public static isKeyHold(key: string) {
    return this.keyPressed.has(key) ? true : false;
  }
  public static isKeyPressed(key: string) {
    if (!this.keyPressed.has(key)) return false;
    this.keyPressed.delete(key);
    return true;
  }
  public static isKeyPressedAny() {
    return this.keyPressed.size === 0 ? false : true;
  }
  public static isMousePressed(key: MouseKey) {
    return this.mousePressed[key] ? true : false;
  }
  public static isMousePressedAny() {
    return Object.values(this.mousePressed).some((key) => key === true)
      ? true
      : false;
  }
}
