import { NaviUINodes } from "../../sandbox/ECSList";
import Draw from "../aurora/urp/draw";
import NaviCore from "./core";
interface Styles {
  backgroundColor: number[];
  textureCrop: number[];
  alpha: number;
  backgroundTexture: number | undefined;
}
export default abstract class NaviNode {
  private content: string;
  private id: string;
  private disabled: boolean;
  private parent: NaviNode;
  private children: string[];
  private position: { x: number; y: number };
  private size: { width: number; height: number };
  private style: Styles;
  onUpdate?: () => void;
  mouseEvent?: () => void;
  constructor(parent: NaviNodeProps) {
    this.content = "";
    this.id = "";
    this.disabled = false;
    this.parent = parent;
    this.children = [];
    this.position = { x: 10, y: 10 };
    this.size = { width: 10, height: 10 };
    this.style = {
      alpha: 255,
      backgroundColor: [0, 0, 0],
      textureCrop: [0, 0, 1, 1],
      backgroundTexture: undefined,
    };
  }

  public set setStyle(style: Partial<Styles>) {
    this.style = { ...this.style, ...style };
  }
  public get getStyle() {
    return this.style;
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
    NaviCore.AddUpdater(this.id);
    this.onUpdate = callback;
  }
  protected registerMouseEvent(callback: () => void) {
    NaviCore.AddMouseListener(this.id);
    this.mouseEvent = callback;
  }
  public addChild<K extends keyof AvalibleUINodes>(
    child: K,
    props?: ConstructorParameters<(typeof NaviUINodes)[K]>[1]
  ): NaviNode {
    // @ts-ignore
    const node = new NaviUINodes[child](this, props ?? {});
    const id = node.id === "" ? crypto.randomUUID() : node.id;
    NaviCore.AddNode(id, node);
    this.children.push(id);
    return NaviCore.getNodeByID<NaviNode>(id)!;
  }

  protected removeChildByIndex(index: number) {
    const removed = this.children.splice(index, 1);
    NaviCore.getNodeByID(removed[0])?.removeAllChildren();
    this.removeTrace(removed[0]);
  }
  protected removeChildByID(ID: string) {
    this.children.splice(this.children.indexOf(ID), 1);
    NaviCore.getNodeByID(ID)?.removeAllChildren();
    this.removeTrace(ID);
  }
  protected removeAllChildren() {
    this.children.forEach((child) => {
      NaviCore.getNodeByID(child)?.removeAllChildren();
      this.removeTrace(child);
    });
  }
  protected removeSelf() {
    if (this.id === "NaviBody") return;
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
    this.children.forEach((child) =>
      NaviCore.getNodeByID(child)?.setDisable(disable)
    );
  }
  //TODO: zrobic to - obecnie oblicza przed stworzeniem obiektu i to problem, musi dostawac do srodka i tam liczyc
  public get centerX() {
    const { position, size } = this.parent.getPosAndSize;
    return position.x + size.width / 2 - this.getSize.width / 2;
  }
  public get centerY() {
    const { position, size } = this.parent.getPosAndSize;
    // console.log(position, size);
    return position.y + size.height / 2 - this.getSize.height / 2;
  }
}
