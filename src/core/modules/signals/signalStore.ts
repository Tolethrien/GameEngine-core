import Signal from "./signal";

export default class SignalStore {
  private static signals: Map<string, Signal> = new Map();

  public static createSignal(name: string) {
    this.signals.set(name, new Signal());
  }
  public static getSignal<T>(name: string) {
    return this.signals.get(name) as Signal<T> | undefined;
  }
  public static removeSignal(name: string) {
    this.signals.delete(name);
  }
  public static emit<T>(name: string, data: T) {
    (this.signals.get(name) as Signal<T> | undefined)?.emit(data);
  }
}
