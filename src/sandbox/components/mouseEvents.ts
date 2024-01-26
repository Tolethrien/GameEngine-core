import Component from "../../core/dogma/component";

export interface MouseEventsProps {
  objectType: "fixed" | "translated";
  action: { left?: string; right?: string; middle?: string };
}
export interface MouseEventsType extends MouseEvents {}
export default class MouseEvents extends Component {
  objectType: "fixed" | "translated";
  action: { left?: string; right?: string; middle?: string };
  constructor(
    componentProps: ComponentProps,
    { action, objectType = "translated" }: MouseEventsProps
  ) {
    super(componentProps);
    this.objectType = objectType;
    this.action = action;
  }
}
