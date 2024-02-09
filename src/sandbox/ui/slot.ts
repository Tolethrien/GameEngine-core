import InputManager from "../../core/modules/inputManager";
import NaviMouseEvent from "../../core/navigpu/components/mouseEvents";
import NaviElement from "../../core/navigpu/elements/element";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  callback: () => void;
  color: RGB;
}
export default class Slot extends NaviElement {
  mouseEvent: NaviMouseEvent;
  constructor({ callback, position, size, color }: NaviButtonProps) {
    super();
    this.mouseEvent = this.addComponent("NaviMouseEvent");
    this.style.setPosition = position;
    this.style.setSize = size;
    this.style.setStyle = { backgroundColor: color, alpha: 255 };
    this.mouseEvent.setEvent(callback, this);
    // this.style.setVisible = false;
  }
  // update(): void {
  //   if (InputManager.isMousePressed("left")) {
  //     console.log("pressed");
  //     this.style.setStyle = { alpha: 100 };
  //   } else {
  //     this.style.setStyle = { alpha: 255 };
  //   }
  // }
}
