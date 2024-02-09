import NaviMouseEvent from "../../core/navigpu/components/mouseEvents";
import NaviElement from "../../core/navigpu/elements/element";
import Slot from "./slot";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
}
export default class Inventory extends NaviElement {
  constructor({ position, size }: NaviButtonProps) {
    super();
    this.children = this.addComponent("NaviChildren");
    this.style.setPosition = position;
    this.style.setSize = size;
    this.style.setStyle = { backgroundColor: [150, 80, 150] };
  }
  public addSlot(color: RGB, callback: () => void) {
    if (this.children?.getChildren.size === 0) {
      this.children.addChild(
        new Slot({
          callback: callback,
          position: {
            x: this.style.getPosition.x,
            y: this.style.getPosition.y,
          },
          size: { height: 5, width: 5 },
          color: color,
        })
      );
    } else {
      const lastSlot = Array.from(this.children!.getChildren.entries()).at(
        -1
      )![1];
      const pos = {
        x: lastSlot.style.getPosition.x + lastSlot.style.getSize.width,
        y: lastSlot.style.getPosition.y + lastSlot.style.getSize.height,
      };
      if (
        pos.x + lastSlot.style.getSize.width <
        this.style.getPosition.x + this.style.getSize.width
      ) {
        console.log("1", pos);
        this.children!.addChild(
          new Slot({
            callback: callback,

            position: {
              x: lastSlot.style.getPosition.x + 5,
              y: lastSlot.style.getPosition.y,
            },
            size: { height: 5, width: 5 },
            color: color,
          })
        );
      } else {
        console.log("2", pos);
        this.children!.addChild(
          new Slot({
            callback: callback,
            position: {
              x: this.style.getPosition.x,
              y: lastSlot.style.getPosition.y + 5,
            },
            size: { height: 5, width: 5 },
            color: color,
          })
        );
      }
    }
  }
  update() {
    super.update();
  }
}
