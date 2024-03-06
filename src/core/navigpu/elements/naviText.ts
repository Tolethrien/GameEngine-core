import NaviNode from "../node";
interface NaviImgProps {
  position: Position2D;
  size: Size2D;
  color: RGB;
  text: string;
}
export default class NaviText extends NaviNode {
  constructor(
    node: NaviNodeProps,
    { color, position, size, text }: NaviImgProps
  ) {
    super(node);
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = {
      backgroundColor: color,
      alpha: 255,
      fontFace: "MedievalSharp",
    };
    this.setContent = text;
    this.setTypOfNode = "Text";
  }
}
