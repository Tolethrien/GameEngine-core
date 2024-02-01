import Draw from "../../aurora/urp/draw";

interface NaviStyle {
  backgroundColor: number[];
}
interface NaviCallbacks {
  onClick: (() => void) | undefined;
  onHover: (() => void) | undefined;
  onEnter: (() => void) | undefined;
  onLeave: (() => void) | undefined;
}
export default abstract class NaviElement {
  private content: string;
  private id: string;
  private children: Map<string, NaviElement>;
  private style: Partial<NaviStyle>;
  private isFocused: boolean;
  private callbacks: NaviCallbacks;
  constructor() {
    this.content = "";
    this.id = "";
    this.children = new Map();
    this.style = {};
    this.isFocused = false;
    this.callbacks = {
      onClick: undefined,
      onEnter: undefined,
      onHover: undefined,
      onLeave: undefined,
    };
  }
  public onClick(callback: () => void) {
    //dodaj ten element do nasłuchiwanych by nie loopowac przez wszystkie elementy ui
    this.callbacks.onClick = callback;
  }
  public get getContent() {
    return this.content;
  }
  public set setContent(content: string) {
    this.content = content;
  }
  public get getID() {
    return this.id;
  }
  public set setID(id: string) {
    this.id = id;
  }
  //   children() {}
  //   callbck() {}
  //   style() {}
  //   rewrite() {}
  draw() {
    Draw.GUI({
      alpha: 255,
      isTexture: 1,
      position: { x: 0, y: 0 },
      size: { height: 50, width: 50 },
      textureToUse: 0,
      tint: new Uint8ClampedArray([255, 0, 0]),
      crop: new Float32Array([0, 0, 1, 1]),
    });
  }
}
