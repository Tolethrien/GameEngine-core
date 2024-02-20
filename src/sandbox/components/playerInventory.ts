import Component from "../../core/dogma/component";
import EntityClone from "../../core/dogma/entityClone";
export type InventorySlot = undefined | EntityClone;
export interface PlayerInventoryType extends PlayerInventory {}
export default class PlayerInventory extends Component {
  inventory: InventorySlot[];
  slotsNumber: number;
  constructor(componentProps: ComponentProps) {
    super(componentProps);
    this.slotsNumber = 5;
    this.inventory = Array(this.slotsNumber).fill(undefined);
  }
}
