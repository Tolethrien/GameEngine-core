import NaviImg from "../../core/navigpu/elements/naviImg";
import NaviText from "../../core/navigpu/elements/naviText";
import NaviNode from "../../core/navigpu/node";
interface NaviButtonProps {
  position: Position2D;
  size: Size2D;
  callback: () => void;
  id: string;
}
export default class ExSlot extends NaviNode {
  text: NaviText;
  img: NaviImg;
  constructor({ callback, position, size, id }: NaviButtonProps) {
    super();
    // this.registerUpdate(callback);
    this.setID = id;
    this.registerMouseEvent(callback);
    this.setPosition = position;
    this.setSize = size;
    this.setStyle = {
      backgroundColor: [55, 55, 55],
      alpha: 255,
    };
    this.img = this.addChild(
      new NaviImg({
        color: [255, 222, 222],
        id: "img",
        position: {
          x: position.x + size.width / 2 - size.width / 2 + 1.5,
          y: position.y + size.height / 2 - size.height / 2 + 1.5,
        },
        size: { width: size.width - 3, height: size.height - 3 },
        textureIndex: 0,
      })
    );
    this.img.setStyle = { alpha: 0 };
    this.text = this.addChild(
      new NaviText({
        color: [255, 222, 222],
        id: "text",
        position: {
          x: position.x + 0.5,
          y: position.y + size.height - 2.5,
        },
        size: { width: 2, height: 2 },
        text: "1",
      })
    );
  }
  addToSlot(count: string, texture: number, color: RGB, crop: RGBA) {
    this.img.setStyle = {
      textureCrop: crop,
      backgroundColor: color,
      backgroundTexture: texture,
      alpha: 255,
    };
    this.text.setContent = count;
  }
  removeFromSlot() {
    this.img.setStyle = { alpha: 0 };
  }
}
