import { MouseCallbacks } from "../../modules/inputManager/inputManager";
import NaviNode from "../node";
interface NaviDivProps {
  callbacks?: Partial<MouseCallbacks>;
  position: Position2D;
  size: Size2D;
  color: RGB;
}
export default class NaviDiv extends NaviNode {
  constructor(
    node: NaviNodeProps,
    { color, position, size, callbacks }: NaviDivProps
  ) {
    super(node);
    this.setPosition = position;
    this.setSize = size;
    if (callbacks) this.registerMouseEvent(callbacks);
    this.setStyle = { backgroundColor: color };
  }
}
