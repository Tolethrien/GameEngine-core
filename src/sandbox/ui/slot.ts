import NaviNode from "../../core/navigpu/node";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  callback: () => void;
  color: RGB;
}
export default class Slot extends NaviNode {
  constructor({ callback, position, size, color }: NaviButtonProps) {
    super();
    // this.registerUpdate(callback);
    this.registerMouseEvent(callback);
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = { backgroundColor: color, alpha: 255 };
  }
}
