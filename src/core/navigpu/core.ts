import { canvas } from "../engine";
import InputManager from "../modules/inputManager/inputManager";
import NaviNode from "./node";

export default abstract class NaviCore {
  private static mouseCallbacks: Set<NaviNode> = new Set();
  private static keyCallbacks: Set<NaviNode> = new Set();
  private static updates: Set<NaviNode> = new Set();
  private static guiElements: Map<string, NaviNode> = new Map();

  public static renderGUI() {
    this.guiElements.forEach(
      (element) => element.getVisible && element.render()
    );
  }
  public static updateGUI() {
    this.updates.forEach(
      (element) => element.getUpdated && element.onUpdate?.()
    );
  }

  public static AddMouseListener(element: NaviNode) {
    this.mouseCallbacks.add(element);
  }
  public static AddUpdater(element: NaviNode) {
    this.updates.add(element);
  }
  public static getCoreElement<T>(label: string) {
    return this.guiElements.get(label) as T | undefined;
  }
  public static getClickedElement() {
    const mousePos = InputManager.getMousePosition;
    return Array.from(this.mouseCallbacks).findLast((element) =>
      this.findClickedElement(element, mousePos)
    );
  }
  public static appendCoreElement(label: string, element: NaviNode) {
    this.guiElements.set(label, element);
  }
  public static removeChild(label: string) {
    const element = this.guiElements.get(label);
    if (!element) return;
    this.mouseCallbacks.delete(element);
    this.guiElements.delete(label);
  }
  public static useClickedElement() {
    const mousePos = InputManager.getMousePosition;
    const element = Array.from(this.mouseCallbacks).findLast((element) =>
      this.findClickedElement(element, mousePos)
    );
    if (element && element.getVisible) {
      element.mouseEvent?.();
      return true;
    }
    return false;
  }
  private static findClickedElement(element: NaviNode, mousePos: Position2D) {
    const { position, size } = this.getPixelValues(element.getPosAndSize);
    if (
      mousePos.x > position.x &&
      mousePos.x < position.x + size.width &&
      mousePos.y > position.y &&
      mousePos.y < position.y + size.height
    ) {
      return element;
    }
  }
  private static getPixelValues({
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
}
