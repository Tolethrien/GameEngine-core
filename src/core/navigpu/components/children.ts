import NaviElement from "../elements/element";

export default class NaviChildren {
  private children: Map<string, NaviElement>;
  constructor() {
    this.children = new Map();
  }
  addChild(child: NaviElement) {
    this.children.set(child.getUUID, child);
  }
  removeChild(child: NaviElement) {
    this.children.delete(child.getUUID);
  }
  getChild(child: NaviElement) {
    return this.children.get(child.getUUID);
  }
  getChildByID(ID: string) {
    const child = Array.from(this.children).find(
      (child) => child[1].getID === ID
    );
    if (child) return this.children.get(child[1].getUUID);
  }
  public get getChildren() {
    return this.children;
  }
}
