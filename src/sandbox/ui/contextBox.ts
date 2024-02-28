import InputManager from "../../core/modules/inputManager/inputManager";
import SignalStore from "../../core/modules/signals/signalStore";
import NaviCore from "../../core/navigpu/core";
import NaviNode from "../../core/navigpu/node";
import { UseItem } from "../systems/items";
interface NaviContextProps {
  position: Position2D;
  index: number;
}
export default class ContextBox extends NaviNode {
  index: number;
  constructor(node: NaviNodeProps, { position, index }: NaviContextProps) {
    super(node);
    this.setRemoveOnDisable = true;
    this.registerUpdate(() => this.removeOnClickOutside());
    this.setSize = { height: 10, width: 4 };
    this.setPosition = position;
    this.index = index;
    this.setPropagation = false;
    this.setStyle = {
      backgroundColor: [255, 255, 255],
      alpha: 255,
    };
    this.addChild("NaviDiv", {
      color: [100, 111, 122],
      position: { x: this.getPosition.x + 0.25, y: this.getPosition.y },
      size: {
        width: this.getSize.width - 0.5,
        height: this.getSize.height / 2,
      },
      callbacks: {
        leftClick: () => {
          SignalStore.getSignal<UseItem>("useItem")?.emit({
            hp: 5,
            index: index,
          });
          this.removeSelf();
        },
      },
    });
    this.addChild("NaviDiv", {
      color: [0, 211, 22],
      position: {
        x: this.getPosition.x + 0.25,
        y: this.getPosition.y + this.getSize.height / 2,
      },
      size: {
        width: this.getSize.width - 0.5,
        height: this.getSize.height / 2,
      },
      callbacks: {
        leftClick: () => {
          SignalStore.getSignal<UseItem>("deleteItem")?.emit({
            hp: 5,
            index: index,
          });
          this.removeSelf();
        },
      },
    });
  }
  removeOnClickOutside() {
    InputManager.isKeyPressedAny() && this.removeSelf();
    NaviCore.clickOutsideNode(this.getPosAndSize) && this.removeSelf();
  }
}
