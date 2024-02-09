//TODO: nowy pomysł -> component driven element, dodawania componentow jak w ecs
// rekursyjnie lec przez wszystkie dzieci i wykonuj update
// render jako komponent list by nie musial leciec przez cale drzewo a po prostu cala lista sie wykonuje jeden po drugim
// to samo mouseEvents by tylko komponenty klikalne tam byly

import NaviChildren from "../components/children";
import { NaviComponents, naviComponents } from "../components/componentsList";
import NaviStyle from "../components/style";
export default abstract class NaviElement {
  private content: string;
  private id: string;
  private uuid: string;
  private styler: NaviStyle;
  private visible: boolean;
  public children: NaviChildren | undefined;
  constructor() {
    this.content = "";
    this.id = "";
    this.visible = true;
    this.uuid = crypto.randomUUID();
    this.styler = new NaviStyle();
  }
  addComponent<T>(component: NaviComponents) {
    return new naviComponents[component]() as T;
  }
  public get getContent() {
    return this.content;
  }
  public set setContent(content: string) {
    this.content = content;
  }
  public get getID() {
    return this.id;
  }
  public set setID(id: string) {
    this.id = id;
  }
  public get getUUID() {
    return this.uuid;
  }
  public get style() {
    return this.styler;
  }

  render() {
    if (this.style.isVisible) {
      this.style.draw();
      if (this.children && this.children.getChildren.size !== 0)
        this.children.getChildren.forEach((child) => child.render());
    }
  }
  update() {
    if (this.children && this.children.getChildren.size !== 0)
      this.children.getChildren.forEach((child) => child.update());
  }
}
