import Draw from "../aurora/urp/draw";
import { canvas } from "../engine";
import NaviCore from "./core";
interface Styles {
  backgroundColor: number[];
  textureCrop: number[];
  alpha: number;
}
export default abstract class NaviNode {
  private content: string;
  private id: string;
  private uuid: string;
  private visible: boolean;
  private updated: boolean;
  private parent: NaviNode | undefined;
  private children: Map<string, NaviNode>;
  private position: { x: number; y: number };
  private size: { width: number; height: number };
  private style: Partial<Styles>;

  onUpdate?: () => void;
  mouseEvent?: () => void;
  constructor(parent?: NaviNode) {
    this.content = "";
    this.id = "";
    this.visible = true;
    this.updated = true;
    this.parent = parent ?? undefined;
    this.uuid = crypto.randomUUID();
    this.children = new Map();
    this.position = { x: 10, y: 10 };
    this.size = { width: 10, height: 10 };
    this.style = {
      alpha: 255,
      backgroundColor: [255, 0, 0],
      textureCrop: [0, 0, 1, 1],
    };
  }
  public set setVisible(visible: boolean) {
    this.visible = visible;
  }
  public get getVisible() {
    return this.visible;
  }
  public set setUpdated(updated: boolean) {
    this.updated = updated;
  }
  public get getUpdated() {
    return this.updated;
  }
  public set setStyle(style: Partial<Styles>) {
    this.style = { ...this.style, ...style };
  }
  public get getStyleInfo() {
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
  public get getUUID() {
    return this.uuid;
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
  public get getChildren() {
    return this.children;
  }
  protected get getParent() {
    return this.parent;
  }
  private set setParent(parent: NaviNode) {
    this.parent = parent;
  }

  protected registerUpdate(callback: () => void) {
    NaviCore.AddUpdater(this);
    this.onUpdate = callback;
  }
  protected registerMouseEvent(callback: () => void) {
    NaviCore.AddMouseListener(this);
    this.mouseEvent = callback;
  }
  protected addChild(child: NaviNode) {
    child.setParent = this;
    this.children.set(child.getUUID, child);
  }
  protected removeChild(child: NaviNode) {
    this.children.delete(child.getUUID);
  }
  protected getChild(child: NaviNode) {
    return this.children.get(child.getUUID);
  }
  protected getChildByID(ID: string) {
    const child = Array.from(this.children).find(
      (child) => child[1].getID === ID
    );
    if (child) return this.children.get(child[1].getUUID);
  }
  public render() {
    if (!this.visible) return;
    Draw.GUI({
      alpha: this.style.alpha!,
      isTexture: 0,
      position: { x: this.position.x, y: this.position.y },
      size: { height: this.size.height, width: this.size.width },
      textureToUse: 0,
      tint: new Uint8ClampedArray(this.style.backgroundColor!),
      crop: new Float32Array(this.style.textureCrop!),
    });
    if (this.children.size !== 0)
      this.children.forEach((child) => child.render());
  }
  //TODO: zrobic to
  public get centerX() {
    if (this.parent) {
      const { position, size } = this.parent.getPosAndSize;
      return position.x + size.width;
    } else {
      return 50 - this.getSize.width / 2;
    }
  }
  public get centerY() {
    if (this.parent) {
      const { position, size } = this.parent.getPosAndSize;
      console.log(position, size);
      return position.x + size.width;
    } else {
      console.log("ni mo");
      return 50 - this.getSize.height / 2;
    }
  }
}
