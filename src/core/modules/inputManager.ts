import { canvas } from "../engine";
import Mat4 from "../math/mat4";
type mouseKeys = "left" | "right" | "middle";
const MOUSE_ENUM: Record<number, mouseKeys> = {
  0: "left",
  1: "middle",
  2: "right",
};
export default class InputManager {
  private static mousePressed: Record<mouseKeys, boolean> = {
    left: false,
    right: false,
    middle: false,
  };
  private static mousePositionOnCavas = [0, 0];
  private static keyPressed = new Set();

  public static initialize() {
    canvas.onmousedown = (event) => {
      this.mousePressed[MOUSE_ENUM[event.button]] = true;
    };
    canvas.onmouseup = (event) => {
      this.mousePressed[MOUSE_ENUM[event.button]] = false;
    };
    canvas.onmousemove = (event) => {
      this.mousePositionOnCavas = [event.offsetX, event.offsetY];
    };
    window.onkeydown = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      !event.repeat && this.keyPressed.add(pressedKey);
    };
    window.onkeyup = (event: KeyboardEvent) => {
      const pressedKey = event.key === " " ? "space" : event.key;
      this.keyPressed.has(pressedKey) && this.keyPressed.delete(pressedKey);
    };
    // window.onresize = () => {
    //   canvas.width = window.innerWidth;
    //   canvas.height = window.innerHeight;
    // };
  }
  public static set setOnResize(func: () => void) {
    window.onresize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      func();
    };
  }

  public static get getMousePosition() {
    return this.mousePositionOnCavas;
  }
  public static getTranslatedMousePosition(projectionViewMatrix: Mat4) {
    const mouseXNormalized =
      (this.mousePositionOnCavas[0] / canvas.width) * 2 - 1;
    const mouseYNormalized =
      -(this.mousePositionOnCavas[1] / canvas.height) * 2 + 1;
    const inverseMatrix = projectionViewMatrix.invert();
    const mouseWorldSpace = inverseMatrix.transform([
      mouseXNormalized,
      mouseYNormalized,
      -1,
      1,
    ]);
    return mouseWorldSpace;
  }

  public static isKeyHold(key: string) {
    return this.keyPressed.has(key) ? true : false;
  }
  public static isKeyPressed(key: string) {
    if (!this.keyPressed.has(key)) return false;
    this.keyPressed.delete(key);
    return true;
  }
  public static isMouseClicked(key: mouseKeys) {
    if (!this.mousePressed[key]) return false;
    this.mousePressed[key] = false;
    return true;
  }
  public static isMouseHold(key: mouseKeys) {
    if (!this.mousePressed[key]) return false;
    return true;
  }
}
