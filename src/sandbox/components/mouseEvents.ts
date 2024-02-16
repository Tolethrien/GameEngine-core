import Component from "../../core/dogma/component";
//TODO: w nocym stylu nie mam typu fied i translated
export interface MouseEventsProps {
  objectType: "fixed" | "translated";
  action: { left?: () => void; right?: string; middle?: string };
}
export interface MouseEventsType extends MouseEvents {}
export default class MouseEvents extends Component {
  objectType: "fixed" | "translated";
  action: { left?: () => void; right?: string; middle?: string };
  constructor(
    componentProps: ComponentProps,
    { action, objectType = "translated" }: MouseEventsProps
  ) {
    super(componentProps);
    this.objectType = objectType;
    this.action = action;
  }
}
