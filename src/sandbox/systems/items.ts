import EntityManager from "../../core/dogma/entityManager";
import System from "../../core/dogma/system";
import SignalStore from "../../core/modules/signals/signalStore";
import NaviCore from "../../core/navigpu/core";
import { PicableItemType } from "../components/picableItem";
import { PlayerInventoryType } from "../components/playerInventory";
import InventoryUI from "../ui/inventory";
export default class Items extends System {
  picable!: GetComponentsList<PicableItemType>;
  inventory!: GetExplicitComponent<PlayerInventoryType>;
  constructor() {
    super();
  }

  onSubscribeList(): void {
    this.picable = this.getComponents("PicableItem")!;
    this.inventory = this.getEntityComponentByTag("PlayerInventory", "player")!;
  }
  onStart(): void {
    SignalStore.createSignal("pickItem");
    SignalStore.getSignal<EntityType>("pickItem")?.subscribe((data) => {
      if (this.picable.has(data.id)) {
        console.log("na ziemi");
        for (let i = 0; i < this.inventory.inventory.length; i++) {
          if (this.inventory.inventory[i] === undefined) {
            this.inventory.inventory[i] = data;
            NaviCore.getCoreElement<InventoryUI>("inventory")?.pickedItem(i);
            break;
          }
          console.log(i);
        }
        EntityManager.removeEntity(data.id);
      }
    });
    SignalStore.createSignal("useItem");
    SignalStore.getSignal<number>("useItem")?.subscribe((data) => {
      if (this.inventory.inventory[data] !== undefined) {
        console.log("plecak");
        NaviCore.getCoreElement<InventoryUI>("inventory")?.removeItem(data);
        EntityManager.addEntityOnLoop(this.inventory.inventory[data]);
        this.inventory.inventory[data] = undefined;
      }
    });
  }
}
