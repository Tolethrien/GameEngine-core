import Component from "../../core/dogma/component";
export type InventorySlot = undefined | EntityType;
export interface PlayerInventoryType extends PlayerInventory {}
export default class PlayerInventory extends Component {
  inventory: InventorySlot[];
  constructor(componentProps: ComponentProps) {
    super(componentProps);
    this.inventory = [undefined, undefined, undefined];
  }
}
