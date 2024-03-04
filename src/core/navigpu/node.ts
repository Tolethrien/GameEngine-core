import { NaviUINodes } from "../../sandbox/ECSList";
import Draw from "../aurora/urp/draw";
import {
  MouseCallbacks,
  MouseOnEvent,
} from "../modules/inputManager/inputManager";
import NaviCore from "./core";
import { NodeStyle, nodeStyle } from "./styleTemplate";
//TODO: zrobic layoutowanie w stylu flexboxa

export default abstract class NaviNode {
  private content: string;
  private id: string;
  private disabled: boolean;
  private parent: NaviNodeProps["parent"];
  private children: string[];
  private position: { x: number; y: number };
  private size: { width: number; height: number };
  private style: NodeStyle;
  private hasMouseListener: boolean;
  private hasUpdater: boolean;
  private onUpdate: (() => void) | undefined;
  private mouseEvent: MouseCallbacks;
  private propagation: boolean;
  private layer: NaviNodeProps["layer"];
  private removeOnDisable: boolean;
  private typeOfNode: "GUI" | "Text";
  constructor(nodeProps: NaviNodeProps) {
    this.content = "";
    this.id = "";
    this.disabled = false;
    this.parent = nodeProps.parent;
    this.children = [];
    this.position = { x: 10, y: 10 };
    this.size = { width: 10, height: 10 };
    this.propagation = true;
    this.onUpdate = undefined;
    this.hasMouseListener = false;
    this.hasUpdater = false;
    this.style = nodeStyle;
    this.layer = nodeProps.layer;
    this.removeOnDisable = false;
    this.typeOfNode = "GUI";
    this.mouseEvent = {
      leftClick: undefined,
      rightClick: undefined,
      dbClick: undefined,
      auxClick: undefined,
      wheelUp: undefined,
      wheelDown: undefined,
    };
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
  public set setTypOfNode(nodeType: "GUI" | "Text") {
    this.typeOfNode = nodeType;
  }
  public get getChildren() {
    return this.children;
  }
  public get getDisabled() {
    return this.disabled;
  }
  public set setStyle(styles: Partial<NodeStyle>) {
    this.style = { ...this.style, ...styles };
  }

  public set setLayer(layer: number) {
    this.layer = layer;
  }
  public get getLayer() {
    return this.layer;
  }

  public set setPosition({ x, y }: Position2D) {
    this.position = { x, y };
  }

  public get getPosition() {
    return this.position;
  }
  public set setSize({ height, width }: Size2D) {
    this.size = { width, height };
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
  public get getHasMouseListener() {
    return this.hasMouseListener;
  }
  public get getContent() {
    return this.content;
  }

  public set setContent(content: string) {
    this.content = content;
  }

  public get getParent() {
    return this.parent;
  }
  public set setRemoveOnDisable(remove: boolean) {
    this.removeOnDisable = remove;
  }
  public get getPropagation() {
    return this.propagation;
  }
  public set setPropagation(propagation: boolean) {
    this.propagation = propagation;
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
    props?: ConstructorParameters<(typeof NaviUINodes)[K]>[1],
    layer?: number
  ): NaviNode {
    const node = new NaviUINodes[child](
      { parent: this, layer: layer ?? this.layer },
      // @ts-ignore
      props ?? {}
    );
    if (node.id === "") {
      node.setID = crypto.randomUUID();
    }
    NaviCore.AddNode(node.getID, node);
    this.children.push(node.getID);
    return NaviCore.getNodeByID<NaviNode>(node.getID)!;
  }

  removeChildByIndex(index: number) {
    const removed = this.children.splice(index, 1);
    NaviCore.getNodeByID(removed[0])?.removeAllChildren();
    NaviCore.removeNode(removed[0]);
  }
  removeChildByID(ID: string) {
    this.children.splice(this.children.indexOf(ID), 1);
    NaviCore.getNodeByID(ID)?.removeAllChildren();
    NaviCore.removeNode(ID);
  }
  removeAllChildren() {
    this.children.forEach((child) => {
      NaviCore.getNodeByID(child)?.removeAllChildren();
      NaviCore.removeNode(child);
    });
  }
  removeSelf() {
    if (this.id === "NaviBody") return;
    this.parent?.removeChildByID(this.id);
    this.removeAllChildren();
    NaviCore.removeNode(this.id);
  }
  protected getChildByIndex(index: number) {
    return NaviCore.getNodeByID(this.children[index]);
  }
  protected getChildByID(ID: string) {
    const child = this.children.find((child) => child === ID);
    if (child !== undefined) return NaviCore.getNodeByID(child);
  }

  public update(elevatedList?: string[][]) {
    if (this.disabled) return;
    if (elevatedList !== undefined && this.layer !== 0) {
      this.setElevated(elevatedList);
      return;
    }
    if (this.hasUpdater) this.onUpdate!();
    this.children.forEach((child) =>
      NaviCore.getNodeByID(child)?.update(elevatedList)
    );
  }
  public render(isElevated: boolean) {
    if (this.disabled || (!isElevated && this.layer !== 0)) return;
    if (this.typeOfNode === "GUI") {
      Draw.GUI({
        alpha: this.style.alpha!,
        isTexture: this.style.backgroundTexture === undefined ? 0 : 1,
        position: { x: this.position.x, y: this.position.y },
        size: { height: this.size.height, width: this.size.width },
        textureToUse: this.style.backgroundTexture ?? 0,
        tint: new Uint8ClampedArray(this.style.backgroundColor!),
        crop: new Float32Array(this.style.textureCrop!),
      });
    } else if (this.typeOfNode === "Text") {
      Draw.GUIText({
        alpha: this.style.alpha!,
        position: { x: this.position.x, y: this.position.y },
        textureToUse: this.style.backgroundTexture ?? 0,
        tint: new Uint8ClampedArray(this.style.backgroundColor!),
        text: this.content,
        fontFace: "roboto",
        fontSize: this.style.fontSize,
      });
    }
    this.children.forEach((child) =>
      NaviCore.getNodeByID(child)?.render(isElevated)
    );
  }
  private setElevated(elevatedList: string[][]) {
    if (elevatedList[this.layer - 1] !== undefined)
      elevatedList[this.layer - 1].push(this.id);
    else {
      elevatedList[this.layer - 1] = [];
      elevatedList[this.layer - 1].push(this.id);
    }
  }
  public setDisable(disable: boolean) {
    this.disabled = disable;
    if (disable === true && this.removeOnDisable) {
      this.removeSelf();
    }
    this.children.forEach((child) =>
      NaviCore.getNodeByID(child)?.setDisable(disable)
    );
  }
}
