import EntityManager from "../../core/dogma/entityManager";
import Engine from "../../core/engine";
import SignalStore from "../../core/modules/signals/signalStore";
import NaviNode from "../../core/navigpu/node";
import Slot from "./slot";
/**
 * Test:
 * 1) dodaj komponent inventory v
 * 2) zrob enity potionu v
 * 3) zrob na niego event ze dodaje go do inventory
 * 4) wyswietl slot w inv.
 * 5) klikajac na item
 *   a) zmienia kolor postaci na kolor potiona
 *   b) usuwa item z inventory
 * 6) ciesz sie!
 * 7) dodaj komponent hp
 * 8) zrob healt bar
 * 9) dodaj do kliku itema ze dodatkowo podnosi Hp o +5
 * 10) dodaj by inventory sie pojawialo/znikalo
 *      a) albo append na nowo
 *      b) albo visible i update off
 * 11) ciesz sie znowu xD
 *
 *
 */
export default class InventoryUI extends NaviNode {
  constructor() {
    super();
    this.setSize = { width: 19, height: 60 };
    this.setPosition = { x: 80, y: 10 };
    // this.registerMouseEvent(() => console.log(this));
    this.addChild(
      new Slot({
        size: { height: 10, width: 10 },
        position: { x: 85, y: 15 },
        callback: () => SignalStore.getSignal("useItem")?.emit(0),
        color: [100, 100, 100],
        id: "inv_0",
      })
    );
    this.addChild(
      new Slot({
        size: { height: 10, width: 10 },
        position: { x: 85, y: 35 },
        callback: () => SignalStore.getSignal("useItem")?.emit(1),
        color: [100, 100, 100],
        id: "inv_1",
      })
    );
    this.addChild(
      new Slot({
        size: { height: 10, width: 10 },
        position: { x: 85, y: 55 },
        callback: () => SignalStore.getSignal("useItem")?.emit(2),
        color: [100, 100, 100],
        id: "inv_1",
      })
    );
  }
  pickedItem(index: number) {
    const child = this.getChildByID(`inv_${index}`);
    if (child) {
      console.log(child);
      child.setStyle = { backgroundColor: [0, 255, 0] };
    }
  }
  removeItem(index: number) {
    const child = this.getChildByID(`inv_${index}`);
    if (child) {
      console.log(child);
      child.setStyle = { backgroundColor: [100, 100, 100] };
    }
  }
}

//   {
//   position: { x: 10, y: 0 },
//   size: { height: 10, width: 10 },
//   callback: () => console.log("s"),
//   color: [100, 100, 100],
// }
