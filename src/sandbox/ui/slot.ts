import NaviNode from "../../core/navigpu/node";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  callback: () => void;
  color: RGB;
  id: string;
}
export default class Slot extends NaviNode {
  constructor(
    node: NaviNode,
    { callback, position, size, color, id }: NaviButtonProps
  ) {
    super(node);
    // this.registerUpdate(callback);
    this.setID = id;
    this.registerMouseEvent(callback);
    this.setSize = size;
    this.setPosition = { x: this.centerX, y: this.centerY };
    this.setStyle = {
      backgroundColor: color,
      alpha: 255,
      // backgroundTexture: 0,
    };
  }
}
