import {InjectionToken} from ".";

export default abstract class RegistryBase<T> {
  protected _registryMap = new Map<InjectionToken<any>, T[]>();

  public entries(): IterableIterator<[InjectionToken<any>, T[]]> {
    return this._registryMap.entries();
  }

  public getAll(key: InjectionToken<any>): T[] {
    this.ensure(key);
    return this._registryMap.get(key)!;
  }

  public get(key: InjectionToken<any>): T | null {
    this.ensure(key);
    const value = this._registryMap.get(key)!;
    return value[value.length - 1] || null;
  }

  public set(key: InjectionToken<any>, value: T): void {
    this.ensure(key);
    this._registryMap.get(key)!.push(value);
  }

  public setAll(key: InjectionToken<any>, value: T[]): void {
    this._registryMap.set(key, value);
  }

  public has(key: InjectionToken<any>): boolean {
    this.ensure(key);
    return this._registryMap.get(key)!.length > 0;
  }

  public clear(): void {
    this._registryMap.clear();
  }

  public delete(key: InjectionToken<any>): void {
    this._registryMap.delete(key);
  }

  private ensure(key: InjectionToken<any>): void {
    if (!this._registryMap.has(key)) {
      this._registryMap.set(key, []);
    }
  }
}
