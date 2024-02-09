import NaviCore from "../core";
import NaviElement from "../elements/element";

export default class NaviMouseEvent {
  private mouseEvent!: (() => void) | undefined;
  constructor() {
    this.mouseEvent = undefined;
  }
  setEvent(callback: () => void, element: NaviElement) {
    this.mouseEvent = callback;
    NaviCore.AddMouseListener(element);
  }
  public get getMouseEvent() {
    return this.mouseEvent;
  }
}
