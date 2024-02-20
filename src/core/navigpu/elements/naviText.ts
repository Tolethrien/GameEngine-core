import NaviNode from "../node";
interface NaviImgProps {
  position: Position2D;
  size: Size2D;
  color: RGB;
  id: string;
  text: string;
}
export default class NaviText extends NaviNode {
  constructor({ color, id, position, size, text }: NaviImgProps) {
    super();
    this.setID = id;
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = {
      backgroundColor: color,
      alpha: 255,
    };
    this.setContent = text;
  }
}
