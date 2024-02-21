import { canvas } from "../engine";
import InputManager from "../modules/inputManager/inputManager";
import NaviBody from "./elements/body";
import NaviNode from "./node";

export default abstract class NaviCore {
  private static mouseCallbacks: Set<string> = new Set();
  private static keyCallbacks: Set<string> = new Set();
  private static updates: Set<string> = new Set();
  private static naviBody = new NaviBody(undefined);
  private static nodes: Map<string, NaviNode> = new Map([
    ["naviBody", this.naviBody],
  ]);
  public static showHUD = true;

  public static renderGUI() {
    if (!this.showHUD) return;
    this.Body.render();
  }

  public static updateGUI() {
    if (!this.showHUD) return;
    this.updates.forEach((element) => {
      const node = this.nodes.get(element);
      node?.getDisabled && node.onUpdate?.();
    });
  }

  public static AddMouseListener(id: string) {
    this.mouseCallbacks.add(id);
  }
  public static removeMouseListener(id: string) {
    this.mouseCallbacks.delete(id);
  }
  public static AddUpdater(id: string) {
    this.updates.add(id);
  }
  public static removeUpdater(id: string) {
    this.updates.delete(id);
  }

  public static get Body() {
    return this.naviBody;
  }

  public static getNodeByID<T = NaviNode>(id: string) {
    return this.nodes.get(id) as T | undefined;
  }
  public static AddNode(id: string, node: NaviNode) {
    this.nodes.set(id, node);
  }
  public static removeNode(id: string) {
    this.nodes.delete(id);
  }
  public static getClickedElement() {
    return this.findClickedElement();
  }

  public static useClickedElement() {
    const element = this.findClickedElement();
    if (element && element.getVisible) {
      element.mouseEvent?.();
      return true;
    }
    return false;
  }

  private static findClickedElement() {
    const mousePos = InputManager.getMousePosition;
    const id = Array.from(this.mouseCallbacks).findLast((id) => {
      const element = this.getNodeByID(id)!;
      const { position, size } = this.getPixelValues(element.getPosAndSize);
      return (
        mousePos.x > position.x &&
        mousePos.x < position.x + size.width &&
        mousePos.y > position.y &&
        mousePos.y < position.y + size.height &&
        true
      );
    });
    if (id) return this.getNodeByID(id);
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
