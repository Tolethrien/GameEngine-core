import NaviElement from "../../core/navigpu/elements/element";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  color: RGB;
}
export default class Bar extends NaviElement {
  baseWidth: number;
  constructor({ position, size, color }: NaviButtonProps) {
    super();
    this.style.setPosition = position;
    this.style.setSize = size;
    this.style.setStyle = { backgroundColor: color, alpha: 255 };
    this.baseWidth = size.width;
  }
}
