import NaviMouseEvent from "../components/mouseEvents";
import NaviElement from "./element";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  text: string;
  callback: () => void;
}
export default class NaviButton extends NaviElement {
  mouseEvent: NaviMouseEvent;
  constructor({ callback, text, position, size }: NaviButtonProps) {
    super();
    this.mouseEvent = this.addComponent("NaviMouseEvent");
    this.setContent = text;
    this.style.setPosition = position;
    this.style.setSize = size;
    this.style.setStyle = { backgroundColor: [150, 80, 150] };
    this.mouseEvent.setEvent(callback, this);
  }
}
