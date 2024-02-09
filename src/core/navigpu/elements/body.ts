import NaviChildren from "../components/children";
import NaviElement from "./element";

export default class NaviBody extends NaviElement {
  children: NaviChildren;
  constructor() {
    super();
    this.children = this.addComponent("NaviChildren");
    this.style.setPosition = { x: 0, y: 0 };
    this.style.setSize = { width: 100, height: 100 };
    this.style.setStyle = { alpha: 0 };
  }
}
