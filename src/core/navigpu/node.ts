import { NaviUINodes } from "../../sandbox/ECSList";
import Draw from "../aurora/urp/draw";
import InputManager, {
  MouseCallbacks,
  MouseOnEvent,
} from "../modules/inputManager/inputManager";
import NaviCore from "./core";
import { NodeStyle, nodeStyle } from "./styleTemplate";
/**
 * layerowanie bo prawy myszy wchodzi pod inne
 * zamykanie ui za pomoca chowania powinno restartowac contexty
 * przemyslec jak przekazywac dane DO ui bo emit() moze tylko wysylac w dol
 */
export default abstract class NaviNode {
  private content: string;
  private id: string;
  private disabled: boolean;
  private parent: NaviNodeProps;
  private children: string[];
  private position: { x: number; y: number };
  private size: { width: number; height: number };
  private style: NodeStyle;
  private hasMouseListener: boolean;
  private hasUpdater: boolean;
  private onUpdate: (() => void) | undefined;
  private mouseEvent: MouseCallbacks;
  constructor(parent: NaviNodeProps) {
    this.content = "";
    this.id = "";
    this.disabled = false;
    this.parent = parent;
    this.children = [];
    this.position = { x: 10, y: 10 };
    this.size = { width: 10, height: 10 };
    this.mouseEvent = {
      leftClick: undefined,
      rightClick: undefined,
      dbClick: undefined,
      auxClick: undefined,
      wheelUp: undefined,
      wheelDown: undefined,
    };
    this.onUpdate = undefined;
    this.hasMouseListener = false;
    this.hasUpdater = false;
    this.style = nodeStyle;
  }

  public set setStyle(style: Partial<NodeStyle>) {
    this.style = { ...this.style, ...style };
  }
  public get getStyle() {
    return this.style;
  }
  public get getUpdate() {
    return this.onUpdate;
  }
  public get getMouseEvents() {
    return this.mouseEvent;
  }
  public set setPosition({ x, y }: Position2D) {
    this.position = { x, y };
  }
  public set setSize({ height, width }: Size2D) {
    this.size = { width, height };
  }

  public get getPosition() {
    return this.position;
  }
  public get getSize() {
    return this.size;
  }
  public get getPosAndSize() {
    return { position: this.position, size: this.size };
  }

  public get getID() {
    return this.id;
  }
  public set setID(id: string) {
    this.id = id;
  }

  public get getContent() {
    return this.content;
  }
  public set setContent(content: string) {
    this.content = content;
  }
  public get getDisabled() {
    return this.disabled;
  }
  protected registerUpdate(callback: () => void) {
    this.hasUpdater = true;
    this.onUpdate = callback;
  }
  protected registerMouseEvent(events: Partial<MouseCallbacks>) {
    this.hasMouseListener = true;
    Object.entries(events).forEach(
      (event) => (this.mouseEvent[event[0] as MouseOnEvent] = event[1])
    );
  }
  public addChild<K extends keyof AvalibleUINodes>(
    child: K,
    props?: ConstructorParameters<(typeof NaviUINodes)[K]>[1]
  ): NaviNode {
    // @ts-ignore
    const node = new NaviUINodes[child](this, props ?? {});
    if (node.id === "") {
      node.setID = crypto.randomUUID();
    }
    NaviCore.AddNode(node.getID, node);
    if (node.hasMouseListener) {
      NaviCore.AddMouseListener(node.getID);
    }
    if (node.hasUpdater) {
      NaviCore.AddUpdater(node.getID);
    }
    this.children.push(node.getID);
    return NaviCore.getNodeByID<NaviNode>(node.getID)!;
  }

  removeChildByIndex(index: number) {
    const removed = this.children.splice(index, 1);
    NaviCore.getNodeByID(removed[0])?.removeAllChildren();
    this.removeTrace(removed[0]);
  }
  removeChildByID(ID: string) {
    this.children.splice(this.children.indexOf(ID), 1);
    NaviCore.getNodeByID(ID)?.removeAllChildren();
    this.removeTrace(ID);
  }
  removeAllChildren() {
    this.children.forEach((child) => {
      NaviCore.getNodeByID(child)?.removeAllChildren();
      this.removeTrace(child);
    });
  }
  removeSelf() {
    if (this.id === "NaviBody") return;
    this.parent?.removeChildByID(this.id);
    this.removeAllChildren();
    this.removeTrace(this.id);
  }
  protected getChildByIndex(index: number) {
    return NaviCore.getNodeByID(this.children[index]);
  }
  protected getChildByID(ID: string) {
    const child = this.children.find((child) => child === ID);
    if (child !== undefined) return NaviCore.getNodeByID(child);
  }
  private removeTrace(id: string) {
    NaviCore.removeMouseListener(id);
    NaviCore.removeUpdater(id);
    NaviCore.removeNode(id);
  }
  public render() {
    if (this.disabled) return;
    Draw.GUI({
      alpha: this.style.alpha!,
      isTexture: this.style.backgroundTexture === undefined ? 0 : 1,
      position: { x: this.position.x, y: this.position.y },
      size: { height: this.size.height, width: this.size.width },
      textureToUse: this.style.backgroundTexture ?? 0,
      tint: new Uint8ClampedArray(this.style.backgroundColor!),
      crop: new Float32Array(this.style.textureCrop!),
    });
    if (this.children.length !== 0)
      this.children.forEach((child) => NaviCore.getNodeByID(child)?.render());
  }

  public setDisable(disable: boolean) {
    this.disabled = disable;
    if (disable === true) {
      if (this.hasUpdater) NaviCore.removeUpdater(this.id);
      if (this.hasMouseListener) NaviCore.removeMouseListener(this.id);
    } else {
      if (this.hasUpdater) NaviCore.AddUpdater(this.id);
      if (this.hasMouseListener) NaviCore.AddMouseListener(this.id);
    }
    this.children.forEach((child) =>
      NaviCore.getNodeByID(child)?.setDisable(disable)
    );
  }
  //TODO: zrobic to - obecnie oblicza przed stworzeniem obiektu i to problem, musi dostawac do srodka i tam liczyc
  // public get centerX() {
  //   const { position, size } = this.parent.getPosAndSize;
  //   return position.x + size.width / 2 - this.getSize.width / 2;
  // }
  // public get centerY() {
  //   const { position, size } = this.parent.getPosAndSize;
  //   // console.log(position, size);
  //   return position.y + size.height / 2 - this.getSize.height / 2;
  // }
  //TODO: zrobic layoutowanie w stylu flexboxa
  private calculateStyle() {
    //===============================
    this.children.forEach((child) =>
      NaviCore.getNodeByID(child)?.calculateStyle()
    );
  }
  public static clickOutsideNode({
    position,
    size,
  }: {
    position: Position2D;
    size: Size2D;
  }) {
    const mousePos = InputManager.getMousePosition;
    const { position: nodePos, size: nodeSize } =
      InputManager.convertPercentToPixels({
        position: position,
        size: size,
      });
    if (
      InputManager.isMousePressedAny() &&
      !(
        mousePos.x > nodePos.x &&
        mousePos.x < nodePos.x + nodeSize.width &&
        mousePos.y > nodePos.y &&
        mousePos.y < nodePos.y + nodeSize.height
      )
    )
      return true;
  }
  public static hoverOverNode({
    position,
    size,
  }: {
    position: Position2D;
    size: Size2D;
  }) {
    const mousePos = InputManager.getMousePosition;
    const { position: nodePos, size: nodeSize } =
      InputManager.convertPercentToPixels({
        position: position,
        size: size,
      });
    if (
      mousePos.x > nodePos.x &&
      mousePos.x < nodePos.x + nodeSize.width &&
      mousePos.y > nodePos.y &&
      mousePos.y < nodePos.y + nodeSize.height
    )
      return true;
  }
}
