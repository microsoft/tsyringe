import constructor from "./types/constructor";

export class DelayedConstructor<T> {
  private reflectMethods: ReadonlyArray<keyof ProxyHandler<any>> = [
    "get",
    "getPrototypeOf",
    "setPrototypeOf",
    "getOwnPropertyDescriptor",
    "defineProperty",
    "has",
    "set",
    "deleteProperty",
    "apply",
    "construct"
  ];

  constructor(private delayedConstructor: constructor<T>) {}

  public createProxy(createObject: (ctor: constructor<T>) => T): T {
    const target: object = {};
    let init = false;
    let value: T;
    const delayedObject: () => T = (): T => {
      if (!init) {
        value = createObject(this.delayedConstructor);
        init = true;
      }
      return value;
    };
    return new Proxy<any>(target, this.createHandler(delayedObject)) as T;
  }

  private createHandler(delayedObject: () => T): ProxyHandler<object> {
    const handler: ProxyHandler<object> = {};
    const install = (name: keyof ProxyHandler<any>): void => {
      handler[name] = (...args: any[]) => {
        args[0] = delayedObject();
        const method = Reflect[name];
        return (method as any)(...args);
      };
    };
    this.reflectMethods.forEach(install);
    return handler;
  }
}

export function delay<T>(
  delayedConstructor: constructor<T>
): DelayedConstructor<T> {
  return new DelayedConstructor<T>(delayedConstructor);
}
