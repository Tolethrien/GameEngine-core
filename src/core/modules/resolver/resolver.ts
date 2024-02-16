export default class Resolver<T = unknown> {
  data: Record<string, T>;
  constructor() {
    this.data = {};
  }
  assignData(name: string, value: T) {
    this.data[name] = value;
  }
  getData(name: string) {
    return this.data[name];
  }
  resolve() {
    console.log("resolved");
  }
}
