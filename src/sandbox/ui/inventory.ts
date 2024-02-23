import EntityClone from "../../core/dogma/entityClone";
import SignalStore from "../../core/modules/signals/signalStore";
import NaviNode from "../../core/navigpu/node";
import { SpriteRendererType } from "../components/spriteRenderer";
import { UseItem } from "../systems/items";
import ItemSlot from "./slot";
/**
 * Test:
 * 1) dodaj komponent inventory v
 * 2) zrob enity potionu v
 * 3) zrob na niego event ze dodaje go do inventory v
 * 4) wyswietl slot w inv. v
 * 5) klikajac na item
 *   a) zmienia kolor postaci na kolor potiona v
 *   b) usuwa item z inventory v
 * 6) ciesz sie!
 * 7) dodaj komponent hp v
 * 8) zrob healt bar v
 * 9) dodaj do kliku itema ze dodatkowo podnosi Hp o +5 v
 * 10) dodaj by inventory sie pojawialo/znikalo v
 *      a) albo append na nowo
 *      b) albo visible i update off v
 * 11) ciesz sie znowu xD
 *
 *
 */
export default class InventoryUI extends NaviNode {
  constructor(node: NaviNodeProps) {
    super(node);

    this.setSize = { width: 30, height: 60 };
    //this.CenterX odnosi sie do THIS! czyli pobiera szerokosc inventory zamiast slotu jak powinien
    this.setPosition = { x: 70, y: 5 };
    this.setID = "inventory";
    this.setStyle = {
      backgroundTexture: 2,
      backgroundColor: [255, 255, 255],
      textureCrop: [0, 0, 650 / 1920, 900 / 1080],
    };
    this.addChild("ItemSlot", {
      size: { height: 7, width: 5 },
      position: { x: 75, y: 15 },
      callbacks: {
        leftClick: () =>
          SignalStore.getSignal<UseItem>("useItem")?.emit({ hp: 5, index: 0 }),
      },
      id: "inv_0",
      index: 0,
    });

    this.addChild("ItemSlot", {
      size: { height: 7, width: 5 },
      position: { x: 81, y: 15 },
      callbacks: {
        leftClick: () =>
          SignalStore.getSignal<UseItem>("useItem")?.emit({ hp: 5, index: 1 }),
      },
      id: "inv_1",
      index: 1,
    });
    this.addChild("ItemSlot", {
      size: { height: 7, width: 5 },
      position: { x: 87, y: 15 },
      callbacks: {
        leftClick: () =>
          SignalStore.getSignal<UseItem>("useItem")?.emit({ hp: 5, index: 2 }),
      },
      id: "inv_2",
      index: 2,
    });
    // this.registerUpdate(() => this.upd());
  }
  pickedItem(index: number, ent: EntityClone) {
    console.log("picked");
    const child = this.getChildByID(`inv_${index}`) as ItemSlot | undefined;
    if (child) {
      const sprite = (
        ent.components.get("SpriteRenderer") as SpriteRendererType
      ).layers[0];
      const color = sprite.tint;
      const crop = sprite.cashedCropData;
      child.addToSlot(
        "1",
        0,
        [color[0], color[1], color[2]],
        [crop[0], crop[1], crop[2], crop[3]]
      );
    }
  }
  removeItem(index: number) {
    const child = this.getChildByID(`inv_${index}`) as ItemSlot | undefined;
    if (child) {
      child.removeFromSlot();
    }
  }
  // getColor(index: number) {
  //   const child = this.getChildByID(`inv_${index}`);
  //   if (!child) return;
  //   return child.getStyleInfo.backgroundColor;
  // }
}
