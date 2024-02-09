import NaviBody from "../../core/navigpu/elements/body";
import Slot from "./slot";

export const body = new NaviBody();

const slot1 = new Slot({
  callback: () => console.log("button2"),
  position: { x: 70, y: 20 },
  size: { height: 8, width: 8 },
});
const slot2 = new Slot({
  callback: () => console.log("button2"),
  position: { x: 80, y: 20 },
  size: { height: 8, width: 8 },
});
const slot3 = new Slot({
  callback: () => console.log("button2"),
  position: { x: 90, y: 20 },
  size: { height: 8, width: 8 },
});

console.log(body);
/**
 * ecs bedzie mial invoke a raczej rerender ktory bedzie bral i na nowo generowal dany element ui
 * czyli np ilosc slotow bedzie generowana na nowo na bazie dlugosci inventory itp
 * kazdy system bedzie mogl ztargetowac konkretna czesc UI po jego id by mogl go updatowac
 *
 * w druga strone, tworzac nowy element ui przypisujesz mu odrazu callback ktory sie stanie po kliknieciu
 */
