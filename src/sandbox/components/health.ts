import Component from "../../core/dogma/component";
import EntityClone from "../../core/dogma/entityClone";
export type InventorySlot = undefined | EntityClone;
export interface PlayerHealthType extends PlayerHealth {}
export default class PlayerHealth extends Component {
  hp: number;
  constructor(componentProps: ComponentProps) {
    super(componentProps);
    this.hp = 5;
  }
}
