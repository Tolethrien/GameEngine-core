import EntityManager from "../../core/dogma/entityManager";
import System from "../../core/dogma/system";
import SignalStore from "../../core/modules/signals/signalStore";
import NaviCore from "../../core/navigpu/core";
import { PlayerHealthType } from "../components/health";
import { PicableItemType } from "../components/picableItem";
import { PlayerInventoryType } from "../components/playerInventory";
import { SpriteRendererType } from "../components/spriteRenderer";
import HPBar from "../ui/hpBar";
import InventoryUI from "../ui/inventory";
export interface UseItem {
  index: number;
  hp: number;
}
export default class Items extends System {
  picable!: GetComponentsList<PicableItemType>;
  inventory!: GetExplicitComponent<PlayerInventoryType>;
  playerSprite!: GetExplicitComponent<SpriteRendererType>;
  playerHP!: GetExplicitComponent<PlayerHealthType>;

  constructor() {
    super();
  }

  onSubscribeList(): void {
    this.picable = this.getComponents("PicableItem");
    this.inventory = this.getEntityComponentByTag("PlayerInventory", "player");
    this.playerHP = this.getEntityComponentByTag("PlayerHealth", "player");
    this.playerSprite = this.getEntityComponentByTag(
      "SpriteRenderer",
      "player"
    );
  }
  onStart(): void {
    SignalStore.createSignal("pickItem");
    SignalStore.getSignal<EntityType["id"]>("pickItem")?.subscribe((id) => {
      if (this.picable.has(id)) {
        for (let i = 0; i < this.inventory.inventory.length; i++) {
          if (this.inventory.inventory[i] === undefined) {
            this.inventory.inventory[i] = EntityManager.cloneEntity(id);
            NaviCore.getNodeByID<InventoryUI>("inventory")?.pickedItem(
              i,
              this.inventory.inventory[i]!
            );
            break;
          }
        }
        EntityManager.removeEntity(id);
      }
    });
    SignalStore.createSignal("useItem");
    SignalStore.getSignal<UseItem>("useItem")?.subscribe((data) => {
      if (this.inventory.inventory[data.index] !== undefined) {
        const ent = this.inventory.inventory[data.index]!;
        const color = (
          ent.components.get("SpriteRenderer")! as SpriteRendererType
        ).layers[0].tint;
        this.playerSprite.layers[0].tint = color;
        this.playerHP.hp += data.hp;
        NaviCore.getNodeByID<HPBar>("hpBar")?.updateHP(data.hp);
        NaviCore.getNodeByID<InventoryUI>("inventory")?.removeItem(data.index);
        EntityManager.addEntityOnLoop(ent);
        this.inventory.inventory[data.index] = undefined;
      }
    });
    SignalStore.createSignal("deleteItem");
    SignalStore.getSignal<UseItem>("deleteItem")?.subscribe((data) => {
      if (this.inventory.inventory[data.index] !== undefined) {
        NaviCore.getNodeByID<InventoryUI>("inventory")?.removeItem(data.index);
        this.inventory.inventory[data.index] = undefined;
      }
    });
  }
}
