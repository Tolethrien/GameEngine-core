import NaviNode from "../../core/navigpu/node";

export default class HPBar extends NaviNode {
  constructor(node: NaviNodeProps) {
    super(node);
    this.setID = "hpBar";
    this.setPosition = { x: 40, y: 90 };
    this.setSize = { width: 10, height: 2 };
    this.setStyle = {
      backgroundColor: [255, 0, 0],
    };
  }
  updateHP(numb: number) {
    this.setSize = {
      height: this.getSize.height,
      width: this.getSize.width + numb,
    };
  }
}
