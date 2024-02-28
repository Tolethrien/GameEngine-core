import NaviNode from "../../core/navigpu/node";
interface NaviDetailProps {
  position: Position2D;
  textureCrop: number[];
  backgroundColor: number[];
  backgroundTexture: number;
}
export default class DetailBox extends NaviNode {
  constructor(
    node: NaviNodeProps,
    {
      position,
      backgroundColor,
      backgroundTexture,
      textureCrop,
    }: NaviDetailProps
  ) {
    super(node);
    this.setSize = { height: 20, width: 10 };
    this.setPosition = position;
    this.setStyle = {
      backgroundColor,
      alpha: 255,
      backgroundTexture,
      textureCrop,
    };
  }
}
