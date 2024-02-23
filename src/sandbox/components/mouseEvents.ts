import Component from "../../core/dogma/component";
import { MouseCallbacks } from "../../core/modules/inputManager/inputManager";
export interface MouseEventsProps {
  action: Partial<MouseCallbacks>;
}
export interface MouseEventsType extends MouseEvents {}
export default class MouseEvents extends Component {
  action: MouseCallbacks;
  constructor(componentProps: ComponentProps, { action }: MouseEventsProps) {
    super(componentProps);
    this.action = {
      leftClick: undefined,
      rightClick: undefined,
      auxClick: undefined,
      dbClick: undefined,
      wheelUp: undefined,
      wheelDown: undefined,
    };
    this.action = { ...this.action, ...action };
  }
}
