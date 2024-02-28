import InputManager, {
  MouseOnEvent,
} from "../modules/inputManager/inputManager";
import NaviBody from "./elements/body";
import NaviNode from "./node";
type PosAndSIze = { position: Position2D; size: Size2D };

export default abstract class NaviCore {
  private static naviBody = new NaviBody({ parent: undefined, layer: 0 });
  private static nodes: Map<string, NaviNode> = new Map([
    ["naviBody", this.naviBody],
  ]);
  public static showHUD = true;

  public static renderGUI() {
    const elevatedList: string[][] = [];
    if (!this.showHUD) return;
    this.Body.update(elevatedList);
    elevatedList.forEach((list) => {
      list.forEach((id) => this.getNodeByID(id)?.update());
    });
    this.Body.render(false);
    elevatedList.forEach((list) => {
      list.forEach((id) => this.getNodeByID(id)?.render(true));
    });
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

  public static useClickedElement(key: MouseOnEvent) {
    const element = this.findClickedElement();
    if (element) {
      if (element.getHasMouseListener) {
        element.getMouseEvents[key]?.();
      } else if (!element.getPropagation) {
        return false;
      } else {
        const prep = this.startPropagation(element);
        if (prep.getMouseEvents[key] !== undefined) {
          prep.getMouseEvents[key]?.();
          return true;
        }
      }
    }
    return false;
  }
  private static startPropagation(element: NaviNode): NaviNode {
    if (element.getParent !== undefined && !element.getHasMouseListener) {
      return this.startPropagation(element.getParent);
    } else {
      return element;
    }
  }
  private static findClickedElement() {
    const element = this.clickedElementRecursiveSearch("naviBody");
    if (element) return this.getNodeByID(element.id);
  }
  public static clickedElementRecursiveSearch(
    currentNode: string,
    lastValue?: { id: string; layer: number }
  ) {
    const node = this.nodes.get(currentNode)!;
    if (node.getDisabled) return lastValue;
    if (NaviCore.isMouseCollide(node.getPosAndSize)) {
      if (lastValue) {
        if (node.getLayer >= lastValue.layer) {
          lastValue = { id: node.getID, layer: node.getLayer };
        }
      } else {
        lastValue = { id: node.getID, layer: node.getLayer };
      }
    }
    node.getChildren.forEach((child) => {
      lastValue = this.clickedElementRecursiveSearch(child, lastValue);
    });
    return lastValue;
  }
  public static clickOutsideNode(pos: PosAndSIze) {
    return (
      InputManager.isMousePressedAny() && !this.isMouseCollide(pos) && true
    );
  }
  public static hoverOverNode(pos: PosAndSIze) {
    return this.isMouseCollide(pos);
  }
  private static isMouseCollide(posAndSize: PosAndSIze) {
    const mousePos = InputManager.getMousePosition;
    const { position, size } = InputManager.convertPercentToPixels(posAndSize);
    return (
      mousePos.x > position.x &&
      mousePos.x < position.x + size.width &&
      mousePos.y > position.y &&
      mousePos.y < position.y + size.height
    );
  }
}
