import EntityClone from "../../core/dogma/entityClone";
import SignalStore from "../../core/modules/signals/signalStore";
import NaviNode from "../../core/navigpu/node";
import { SpriteRendererType } from "../components/spriteRenderer";
import { UseItem } from "../systems/items";
import ItemSlot from "./exSlot";
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
    this.setSize = { width: 19, height: 60 };
    //this.CenterX odnosi sie do THIS! czyli pobiera szerokosc inventory zamiast slotu jak powinien
    this.setPosition = { x: this.centerX, y: this.centerY };
    this.setID = "inventory";
    this.addChild("ItemSlot", {
      size: { height: 10, width: 10 },
      position: { x: this.centerX, y: this.centerY },
      callback: () =>
        SignalStore.getSignal<UseItem>("useItem")?.emit({ hp: 5, index: 0 }),
      id: "inv_0",
    });
    // this.addChild("ItemSlot", {
    //   size: { height: 10, width: 10 },
    //   position: { x: 85, y: 35 },
    //   callback: () =>
    //     SignalStore.getSignal<UseItem>("useItem")?.emit({ hp: 25, index: 1 }),
    //   id: "inv_1",
    // });
    // this.addChild("ItemSlot", {
    //   size: { height: 10, width: 10 },
    //   position: { x: 85, y: 55 },
    //   callback: () => SignalStore.getSignal("useItem")?.emit(2),
    //   id: "inv_2",
    // });
    // this.registerUpdate(() => this.upd());
  }
  pickedItem(index: number, ent: EntityClone) {
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
  upd() {
    console.log("ss");
  }
}
