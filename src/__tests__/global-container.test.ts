/* eslint-disable @typescript-eslint/interface-name-prefix */

import {inject, injectable, registry, singleton} from "../decorators";
import {instanceCachingFactory, predicateAwareClassFactory} from "../factories";
import {DependencyContainer} from "../types";
import {instance as globalContainer} from "../dependency-container";
import injectAll from "../decorators/inject-all";
import Lifecycle from "../types/lifecycle";
import {ValueProvider} from "../providers";

interface IBar {
  value: string;
}

afterEach(() => {
  globalContainer.reset();
});

// --- registerSingleton() ---

test("a singleton registration can be redirected", async () => {
  @singleton()
  class MyService {}

  class MyServiceMock {}

  @injectable()
  class MyClass {
    constructor(public myService: MyService) {}
  }

  globalContainer.registerSingleton(MyService, MyServiceMock);
  const myClass = await globalContainer.resolve(MyClass);

  expect(myClass.myService).toBeInstanceOf(MyServiceMock);
});

// --- resolve() ---

test("fails to resolve unregistered dependency by name", async () => {
  await expect(globalContainer.resolve("NotRegistered")).rejects.toThrow();
});

test("allows arrays to be registered by value provider", async () => {
  class Bar {}

  const value = [new Bar()];
  globalContainer.register<Bar[]>("BarArray", {useValue: value});

  const barArray = await globalContainer.resolve<Bar[]>("BarArray");
  expect(Array.isArray(barArray)).toBeTruthy();
  expect(value === barArray).toBeTruthy();
});

test("allows arrays to be registered by factory provider", async () => {
  class Bar {}

  globalContainer.register<Bar>(Bar, {useClass: Bar});
  globalContainer.register<Bar[]>("BarArray", {
    useFactory: async (container): Promise<Bar[]> => {
      return [await container.resolve(Bar)];
    }
  });

  const barArray = await globalContainer.resolve<Bar[]>("BarArray");
  expect(Array.isArray(barArray)).toBeTruthy();
  expect(barArray.length).toBe(1);
  expect(barArray[0]).toBeInstanceOf(Bar);
});

test("resolves transient instances when not registered", async () => {
  class Bar {}

  const myBar = await globalContainer.resolve(Bar);
  const myBar2 = await globalContainer.resolve(Bar);

  expect(myBar instanceof Bar).toBeTruthy();
  expect(myBar2 instanceof Bar).toBeTruthy();
  expect(myBar).not.toBe(myBar2);
});

test("resolves a transient instance when registered by class provider", async () => {
  class Bar {}
  globalContainer.register("Bar", {useClass: Bar});

  const myBar = await globalContainer.resolve<Bar>("Bar");
  const myBar2 = await globalContainer.resolve<Bar>("Bar");

  expect(myBar instanceof Bar).toBeTruthy();
  expect(myBar2 instanceof Bar).toBeTruthy();
  expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when class provider registered as singleton", async () => {
  class Bar {}
  globalContainer.register(
    "Bar",
    {useClass: Bar},
    {lifecycle: Lifecycle.Singleton}
  );

  const myBar = await globalContainer.resolve<Bar>("Bar");
  const myBar2 = await globalContainer.resolve<Bar>("Bar");

  expect(myBar instanceof Bar).toBeTruthy();
  expect(myBar).toBe(myBar2);
});

test("resolves a transient instance when using token alias", async () => {
  class Bar {}
  globalContainer.register("Bar", {useClass: Bar});
  globalContainer.register("BarAlias", {useToken: "Bar"});

  const myBar = await globalContainer.resolve<Bar>("BarAlias");
  const myBar2 = await globalContainer.resolve<Bar>("BarAlias");

  expect(myBar instanceof Bar).toBeTruthy();
  expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when token alias registered as singleton", async () => {
  class Bar {}
  globalContainer.register("Bar", {useClass: Bar});
  globalContainer.register(
    "SingletonBar",
    {useToken: "Bar"},
    {lifecycle: Lifecycle.Singleton}
  );

  const myBar = await globalContainer.resolve<Bar>("SingletonBar");
  const myBar2 = await globalContainer.resolve<Bar>("SingletonBar");

  expect(myBar instanceof Bar).toBeTruthy();
  expect(myBar).toBe(myBar2);
});

test("resolves same instance when registerInstance() is used with a class", async () => {
  class Bar {}
  const instance = new Bar();
  globalContainer.registerInstance(Bar, instance);

  expect(await globalContainer.resolve(Bar)).toBe(instance);
});

test("resolves same instance when registerInstance() is used with a name", async () => {
  class Bar {}
  const instance = new Bar();
  globalContainer.registerInstance("Test", instance);

  expect(await globalContainer.resolve("Test")).toBe(instance);
});

test("registerType() allows for classes to be swapped", async () => {
  class Bar {}
  class Foo {}
  globalContainer.registerType(Bar, Foo);

  expect((await globalContainer.resolve<Foo>(Bar)) instanceof Foo).toBeTruthy();
});

test("registerType() allows for names to be registered for a given type", async () => {
  class Bar {}
  globalContainer.registerType("CoolName", Bar);

  expect(
    (await globalContainer.resolve<Bar>("CoolName")) instanceof Bar
  ).toBeTruthy();
});

test("executes a registered factory each time resolve is called", async () => {
  const factoryMock = jest.fn();
  globalContainer.register("Test", {useFactory: factoryMock});

  await globalContainer.resolve("Test");
  await globalContainer.resolve("Test");

  expect(factoryMock.mock.calls.length).toBe(2);
});

test("resolves to factory result each time resolve is called", async () => {
  const factoryMock = jest.fn();
  globalContainer.register("Test", {useFactory: factoryMock});
  const value1 = 1;
  const value2 = 2;

  factoryMock.mockReturnValue(value1);
  const result1 = await globalContainer.resolve("Test");
  factoryMock.mockReturnValue(value2);
  const result2 = await globalContainer.resolve("Test");

  expect(result1).toBe(value1);
  expect(result2).toBe(value2);
});

test("resolves anonymous classes separately", async () => {
  const ctor1 = (() => class {})();
  const ctor2 = (() => class {})();

  globalContainer.registerInstance(ctor1, new ctor1());
  globalContainer.registerInstance(ctor2, new ctor2());

  expect((await globalContainer.resolve(ctor1)) instanceof ctor1).toBeTruthy();
  expect((await globalContainer.resolve(ctor2)) instanceof ctor2).toBeTruthy();
});

// --- resolveAll() ---

test("resolveAll of unregistered dependency by name returns empty array", async () => {
  const notRegisteredResult = await globalContainer.resolveAll("NotRegistered");
  expect(notRegisteredResult).toEqual([]);
});

test("resolves an array of transient instances bound to a single interface", async () => {
  interface FooInterface {
    bar: string;
  }

  class FooOne implements FooInterface {
    public bar = "foo1";
  }

  class FooTwo implements FooInterface {
    public bar = "foo2";
  }

  globalContainer.register<FooInterface>("FooInterface", {useClass: FooOne});
  globalContainer.register<FooInterface>("FooInterface", {useClass: FooTwo});

  const fooArray = await globalContainer.resolveAll<FooInterface>(
    "FooInterface"
  );
  expect(Array.isArray(fooArray)).toBeTruthy();
  expect(fooArray[0]).toBeInstanceOf(FooOne);
  expect(fooArray[1]).toBeInstanceOf(FooTwo);
});

test("resolves all transient instances when not registered", async () => {
  class Foo {}

  const foo1 = await globalContainer.resolveAll<Foo>(Foo);
  const foo2 = await globalContainer.resolveAll<Foo>(Foo);

  expect(Array.isArray(foo1)).toBeTruthy();
  expect(Array.isArray(foo2)).toBeTruthy();
  expect(foo1[0]).toBeInstanceOf(Foo);
  expect(foo2[0]).toBeInstanceOf(Foo);
  expect(foo1[0]).not.toBe(foo2[0]);
});

// --- isRegistered() ---

test("returns true for a registered singleton class", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  globalContainer.registerSingleton(Foo);

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered class provider", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  globalContainer.register(Foo, {useClass: Foo});

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered value provider", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  globalContainer.register(Foo, {useValue: {}} as ValueProvider<any>);

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered token provider", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  globalContainer.register(Foo, {useToken: "Bar"});

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

// --- clearInstances() ---

test("clears ValueProvider registrations", async () => {
  class Foo {}
  const instance1 = new Foo();
  globalContainer.registerInstance("Test", instance1);

  expect(await globalContainer.resolve("Test")).toBeInstanceOf(Foo);

  globalContainer.clearInstances();

  await expect(globalContainer.resolve("Test")).rejects.toThrow();
});

test("clears cached instances from container.resolve() calls", async () => {
  @singleton()
  class Foo {}
  const instance1 = globalContainer.resolve(Foo);

  globalContainer.clearInstances();

  // Foo should still be registered as singleton
  const instance2 = await globalContainer.resolve(Foo);
  const instance3 = await globalContainer.resolve(Foo);

  expect(instance1).not.toBe(instance2);
  expect(instance2).toBe(instance3);
  expect(instance3).toBeInstanceOf(Foo);
});

// --- @injectable ---

test("@injectable resolves when not using DI", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  const myValue = "test";
  const myBar = new Bar();
  myBar.value = myValue;

  const myFoo = new Foo(myBar);

  expect(myFoo.myBar.value).toBe(myValue);
});

test("@injectable resolves when using DI", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  const myFoo = await globalContainer.resolve(Foo);

  expect(myFoo.myBar.value).toBe("");
});

test("@injectable resolves nested dependencies when using DI", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  @injectable()
  class FooBar {
    constructor(public myFoo: Foo) {}
  }
  const myFooBar = await globalContainer.resolve(FooBar);

  expect(myFooBar.myFoo.myBar.value).toBe("");
});

test("@injectable preserves static members", async () => {
  const value = "foobar";

  @injectable()
  class MyStatic {
    public static testVal = value;

    public static testFunc(): string {
      return value;
    }
  }

  expect(MyStatic.testFunc()).toBe(value);
  expect(MyStatic.testVal).toBe(value);
});

test("@injectable handles optional params", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  @injectable()
  class MyOptional {
    constructor(public myFoo?: Foo) {}
  }

  const myOptional = await globalContainer.resolve(MyOptional);
  expect(myOptional.myFoo instanceof Foo).toBeTruthy();
});

test("@singleton registers class as singleton with the global container", async () => {
  @singleton()
  class Bar {}

  const myBar = await globalContainer.resolve(Bar);
  const myBar2 = await globalContainer.resolve(Bar);

  expect(myBar instanceof Bar).toBeTruthy();
  expect(myBar).toBe(myBar2);
});

test("dependencies of an @singleton can be resolved", async () => {
  class Foo {}

  @singleton()
  class Bar {
    constructor(public foo: Foo) {}
  }

  const myBar = await globalContainer.resolve(Bar);

  expect(myBar.foo instanceof Foo).toBeTruthy();
});

test("passes through the given params", async () => {
  @injectable()
  class MyViewModel {
    constructor(public a: any, public b: any, public c: any) {}
  }

  const a = {};
  const b = {};
  const c = {};
  const instance = new MyViewModel(a, b, c);

  expect(instance.a).toBe(a);
  expect(instance.b).toBe(b);
  expect(instance.c).toBe(c);
});

// --- @registry ---

test("doesn't blow up with empty args", async () => {
  @registry()
  class RegisteringFoo {}

  expect(() => new RegisteringFoo()).not.toThrow();
});

test("registers by type provider", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }
  @registry([{token: Bar, useClass: Bar}])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(Bar)).toBeTruthy();
});

test("registers by class provider", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }
  const registration = {
    token: "IBar",
    useClass: Bar
  };

  @registry([registration])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers by value provider", async () => {
  const registration = {
    token: "IBar",
    useValue: {}
  };

  @registry([registration])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers by token provider", async () => {
  const registration = {
    token: "IBar",
    useToken: "IFoo"
  };

  @registry([registration])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers by factory provider", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  const registration = {
    token: "IBar",
    useFactory: async (globalContainer: DependencyContainer) =>
      await globalContainer.resolve(Bar)
  };

  @registry([registration])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
});

test("registers mixed types", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) {}
  }
  const registration = {
    token: "IBar",
    useClass: Bar
  };

  @registry([registration, {token: Foo, useClass: Foo}])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("registers by symbol token provider", async () => {
  const registration = {
    token: Symbol("obj1"),
    useValue: {}
  };

  @registry([registration])
  class RegisteringFoo {}

  new RegisteringFoo();

  expect(globalContainer.isRegistered(registration.token)).toBeTruthy();
  expect(await globalContainer.resolve(registration.token)).toEqual(
    registration.useValue
  );
});

// --- @inject ---

test("allows interfaces to be resolved from the constructor with injection token", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  @registry([{token: Bar, useClass: Bar}])
  class FooWithInterface {
    constructor(@inject(Bar) public myBar: IBar) {}
  }

  const myFoo = await globalContainer.resolve(FooWithInterface);

  expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

test("allows interfaces to be resolved from the constructor with just a name", async () => {
  @injectable()
  class Bar implements IBar {
    public value = "";
  }

  @injectable()
  @registry([
    {
      token: "IBar",
      useClass: Bar
    }
  ])
  class FooWithInterface {
    constructor(@inject("IBar") public myBar: IBar) {}
  }

  const myFoo = await globalContainer.resolve(FooWithInterface);

  expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

test("allows explicit array dependencies to be resolved by inject decorator", async () => {
  @injectable()
  class Foo {}

  @injectable()
  class Bar {
    constructor(@inject("FooArray") public foo: Foo[]) {}
  }

  const fooArray = [new Foo()];
  globalContainer.register<Foo[]>("FooArray", {useValue: fooArray});
  globalContainer.register<Bar>(Bar, {useClass: Bar});

  const bar = await globalContainer.resolve<Bar>(Bar);
  expect(bar.foo === fooArray).toBeTruthy();
});

// --- @injectAll ---

test("injects all dependencies bound to a given interface", async () => {
  interface Foo {
    str: string;
  }

  class FooImpl1 implements Foo {
    public str = "foo1";
  }

  class FooImpl2 implements Foo {
    public str = "foo2";
  }

  @injectable()
  class Bar {
    constructor(@injectAll("Foo") public foo: Foo[]) {}
  }

  globalContainer.register<Foo>("Foo", {useClass: FooImpl1});
  globalContainer.register<Foo>("Foo", {useClass: FooImpl2});

  const bar = await globalContainer.resolve<Bar>(Bar);
  expect(Array.isArray(bar.foo)).toBeTruthy();
  expect(bar.foo.length).toBe(2);
  expect(bar.foo[0]).toBeInstanceOf(FooImpl1);
  expect(bar.foo[1]).toBeInstanceOf(FooImpl2);
});

test("allows array dependencies to be resolved if a single instance is in the container", async () => {
  @injectable()
  class Foo {}

  @injectable()
  class Bar {
    constructor(@injectAll(Foo) public foo: Foo[]) {}
  }
  globalContainer.register<Foo>(Foo, {useClass: Foo});
  globalContainer.register<Bar>(Bar, {useClass: Bar});

  const bar = await globalContainer.resolve<Bar>(Bar);
  expect(bar.foo.length).toBe(1);
});

// --- factories ---

test("instanceCachingFactory caches the returned instance", async () => {
  const factory = instanceCachingFactory(async () => {});

  expect(await factory(globalContainer)).toBe(await factory(globalContainer));
});

test("instanceCachingFactory caches the returned instance even when there is branching logic in the factory", async () => {
  const instanceA = {};
  const instanceB = {};
  let useA = true;

  const factory = instanceCachingFactory(async () =>
    useA ? instanceA : instanceB
  );

  expect(await factory(globalContainer)).toBe(instanceA);
  useA = false;
  expect(await factory(globalContainer)).toBe(instanceA);
});

test("predicateAwareClassFactory correctly switches the returned instance with caching on", async () => {
  class A {}
  class B {}
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B);

  expect((await factory(globalContainer)) instanceof A).toBeTruthy();
  useA = false;
  expect((await factory(globalContainer)) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns the same instance each call with caching on", async () => {
  class A {}
  class B {}
  const factory = predicateAwareClassFactory(() => true, A, B);

  expect(await factory(globalContainer)).toBe(await factory(globalContainer));
});

test("predicateAwareClassFactory correctly switches the returned instance with caching off", async () => {
  class A {}
  class B {}
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B, false);

  expect((await factory(globalContainer)) instanceof A).toBeTruthy();
  useA = false;
  expect((await factory(globalContainer)) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns new instances each call with caching off", async () => {
  class A {}
  class B {}
  const factory = predicateAwareClassFactory(() => true, A, B, false);

  expect(await factory(globalContainer)).not.toBe(
    await factory(globalContainer)
  );
});
