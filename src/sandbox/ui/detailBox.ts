import NaviNode from "../../core/navigpu/node";
interface NaviDetailProps {
  position: Position2D;
}
export default class DetailBox extends NaviNode {
  constructor(node: NaviNodeProps, { position }: NaviDetailProps) {
    super(node);
    this.setSize = { height: 20, width: 10 };
    this.setPosition = position;
    this.setStyle = {
      backgroundColor: [5, 255, 255],
      alpha: 255,
    };
  }
}
