import NaviNode from "../../core/navigpu/node";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  callback: () => void;
  color: RGB;
  id: string;
}
export default class Slot extends NaviNode {
  constructor({ callback, position, size, color, id }: NaviButtonProps) {
    super();
    // this.registerUpdate(callback);
    this.setID = id;
    this.registerMouseEvent(callback);
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = { backgroundColor: color, alpha: 255 };
  }
}
