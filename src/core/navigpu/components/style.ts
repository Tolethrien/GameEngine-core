import Draw from "../../aurora/urp/draw";
interface Styles {
  backgroundColor: number[];
  textureCrop: number[];
  alpha: number;
}
export default class NaviStyle {
  private position: { x: number; y: number };
  private size: { width: number; height: number };
  private style: Partial<Styles>;
  private visible: boolean;
  constructor() {
    this.position = { x: 0, y: 0 };
    this.size = { width: 0, height: 0 };
    this.visible = true;
    this.style = {
      alpha: 255,
      backgroundColor: [255, 0, 0],
      textureCrop: [0, 0, 1, 1],
    };
  }
  draw() {
    Draw.GUI({
      alpha: this.style.alpha!,
      isTexture: 0,
      position: { x: this.position.x, y: this.position.y },
      size: { height: this.size.height, width: this.size.width },
      textureToUse: 0,
      tint: new Uint8ClampedArray(this.style.backgroundColor!),
      crop: new Float32Array(this.style.textureCrop!),
    });
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
  public get isVisible() {
    return this.visible;
  }
  public set setVisible(visible: boolean) {
    this.visible = visible;
  }
}
