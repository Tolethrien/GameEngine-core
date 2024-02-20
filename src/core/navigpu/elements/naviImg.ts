import NaviNode from "../node";
interface NaviImgProps {
  position: Position2D;
  size: Size2D;
  color: RGB;
  id: string;
  textureIndex: number;
}
export default class NaviImg extends NaviNode {
  constructor({ color, id, position, size, textureIndex }: NaviImgProps) {
    super();
    this.setID = id;
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = {
      backgroundColor: color,
      alpha: 255,
      backgroundTexture: textureIndex,
    };
  }
}
