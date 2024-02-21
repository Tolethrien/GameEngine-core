import NaviNode from "../node";

export default class NaviBody extends NaviNode {
  constructor(node: NaviNodeProps) {
    super(node);
    this.setID = "NaviBody";
    this.setPosition = { x: 0, y: 0 };
    this.setSize = { width: 100, height: 100 };
    this.setStyle = {
      alpha: 0,
    };
  }
}
