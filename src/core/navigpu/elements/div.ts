import NaviChildren from "../components/children";
import NaviElement from "./element";
export default class NaviDiv extends NaviElement {
  children: NaviChildren;
  constructor() {
    super();
    this.children = this.addComponent("NaviChildren");
    this.style.setPosition = { x: 50, y: 50 };
    this.style.setSize = { width: 20, height: 20 };
    this.style.setStyle = { backgroundColor: [100, 100, 100] };
  }
}
