export default class Signal<T = undefined> {
  listeners: Set<(data: T) => void>;
  constructor() {
    this.listeners = new Set();
  }
  subscribe(listener: (data: T) => void) {
    this.listeners.add(listener);
  }
  unsubscribe(listener: (data: T) => void) {
    this.listeners.delete(listener);
  }
  emit(data: T) {
    this.listeners.forEach((listener) => listener(data));
  }
}
