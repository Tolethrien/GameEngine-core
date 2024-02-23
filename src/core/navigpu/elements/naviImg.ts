import NaviNode from "../node";
interface NaviImgProps {
  position: Position2D;
  size: Size2D;
  color: RGB;
  textureIndex: number;
}
export default class NaviImg extends NaviNode {
  constructor(
    node: NaviNodeProps,
    { color, position, size, textureIndex }: NaviImgProps
  ) {
    super(node);
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = {
      backgroundColor: color,
      alpha: 255,
      backgroundTexture: textureIndex,
      textureCrop: [0, 0, 0, 0],
    };
  }
}
