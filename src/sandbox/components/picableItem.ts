import Component from "../../core/dogma/component";
export type InventorySlot = [EntityType, number];
export interface PicableItemType extends PicableItem {}
export default class PicableItem extends Component {
  isPicked: boolean;
  constructor(componentProps: ComponentProps) {
    super(componentProps);
    this.isPicked = false;
  }
}
