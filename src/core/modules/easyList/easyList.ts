export default class EasyList<T = unknown> {
  private list: T[];
  constructor(initial?: T[]) {
    this.list = initial ?? [];
  }

  public add(data: T, onSlot?: number) {
    if (onSlot !== undefined) {
      this.list.splice(onSlot, 0, data);
      return this.list[onSlot];
    } else {
      this.list.push(data);
      return this.list.at(-1)!;
    }
  }
  public removeByIndex(index: number) {
    this.list.splice(index, 1);
  }
  public removeByValue(value: T, type: "first" | "last") {
    if (type == "first") {
      const index = this.list.indexOf(value);
      this.list.splice(index, 1);
    } else if (type === "last") {
      const index = this.list.lastIndexOf(value);
      this.list.splice(index, 1);
    }
  }
  public removeBySearch() {
    //
  }

  public get size() {
    return this.list.length;
  }
  public get getList() {
    return this.list;
  }
}
