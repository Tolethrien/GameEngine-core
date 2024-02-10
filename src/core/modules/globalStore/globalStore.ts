export default class GlobalStore {
  private static store = new Map();
  public static addToStore(key: string, ...data: unknown[]) {
    this.store.set(key, data);
  }
  public static removeFromStore(key: string) {
    if (!this.store.delete(key))
      console.warn(
        `GlobalStore: ${key} is set to be removed but it's doesn't exist in store`
      );
  }
  public static getFromStore<T>(key: string): T {
    const value = this.store.get(key);
    !value && console.warn(`GlobalStore: ${key} doesn't exist in store`);
    return value as T;
  }
}
