import { MouseCallbacks } from "../../core/modules/inputManager/inputManager";
import NaviCore from "../../core/navigpu/core";
import NaviImg from "../../core/navigpu/elements/naviImg";
import NaviText from "../../core/navigpu/elements/naviText";
import NaviNode from "../../core/navigpu/node";
import DetailBox from "./detailBox";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  callbacks: Partial<MouseCallbacks>;
  id: string;
  index: number;
}
export default class ItemSlot extends NaviNode {
  text: NaviText;
  img: NaviImg;
  detail: DetailBox | undefined;
  index: number;
  isEmpty: boolean;
  constructor(
    node: NaviNodeProps,
    { callbacks, position, size, id, index }: NaviButtonProps
  ) {
    super(node);
    this.registerUpdate(() => this.onHover());
    this.setID = id;
    this.registerMouseEvent(callbacks);
    this.setSize = { height: size.height, width: size.width };
    this.setPosition = position;
    this.detail = undefined;
    this.index = index;
    this.isEmpty = true;
    this.setStyle = {
      backgroundColor: [255, 255, 255],
      alpha: 255,
      backgroundTexture: 2,
      textureCrop: [650 / 1920, 0, (650 + 100) / 1920, 100 / 1080],
    };

    this.img = this.addChild("NaviImg", {
      color: [255, 222, 222],
      position: {
        x: position.x + size.width / 2 - size.width / 2 + 1.5,
        y: position.y + size.height / 2 - size.height / 2 + 1.5,
      },
      size: { width: size.width - 3, height: size.height - 3 },
      textureIndex: 0,
    });

    this.text = this.addChild("NaviText", {
      color: [255, 222, 222],
      position: {
        x: position.x + 0.5,
        y: position.y + size.height - 2.5,
      },
      size: { width: 1, height: 1 },
      text: "1",
    });
    this.text.setPropagation = false;
    this.getMouseEvents.rightClick = () =>
      this.addChild(
        "ContextBox",
        {
          position: { x: this.getPosition.x + 5, y: this.getPosition.y + 5 },
          index: index,
        },
        1
      );
  }
  onHover() {
    if (!this.isEmpty && NaviCore.hoverOverNode(this.getPosAndSize)) {
      if (this.detail === undefined) {
        this.detail = this.addChild("DetailBox", {
          position: { x: this.getPosition.x - 12, y: this.getPosition.y },
          backgroundColor: this.img.getStyle.backgroundColor,
          backgroundTexture: this.img.getStyle.backgroundTexture!,
          textureCrop: this.img.getStyle.textureCrop,
        });
        NaviCore.getNodeByID("hpBar")!.setStyle = {
          backgroundColor: this.img.getStyle.backgroundColor,
        };
      }
    } else {
      if (this.detail !== undefined) {
        this.removeChildByID(this.detail.getID);
        this.detail = undefined;
      }
    }
  }
  addToSlot(count: string, texture: number, color: RGB, crop: RGBA) {
    this.img.setStyle = {
      textureCrop: crop,
      backgroundColor: color,
      backgroundTexture: 0,
    };
    this.text.setContent = count;
    this.isEmpty = false;
  }
  removeFromSlot() {
    this.isEmpty = true;
    this.img.setStyle = { textureCrop: [0, 0, 0, 0] };
  }
}
