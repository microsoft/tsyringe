import { instanceCachingFactory, predicateAwareClassFactory } from "../src/factories";
import { Provider } from "../src/providers";
import { inject, injectable, registry } from "../src/decorators";
import {instance as globalContainer} from "../src/dependency-container";

interface IBar {
  value: string;
}

afterEach(() => {
  globalContainer.reset();
});

// --- resolve() ---

test("fails to resolve unregistered dependency by name", () => {
  expect(() => {
    globalContainer.resolve("NotRegistered");
  }).toThrow();
});

test("resolves transient instances when not registered", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  const myBar = globalContainer.resolve(Bar);
  myBar.value = "test";
  const myBar2 = globalContainer.resolve(Bar);

  expect(myBar.value).not.toBe(myBar2.value);
});

test("resolves a transient instance when registered by class", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  globalContainer.register(Bar);

  const myBar = globalContainer.resolve(Bar);
  const myBar2 = globalContainer.resolve(Bar);

  expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when class registered as singleton", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  globalContainer.register(Bar, {singleton: true});

  const myBar = globalContainer.resolve(Bar);
  const myBar2 = globalContainer.resolve(Bar);

  expect(myBar).toBe(myBar2);
});

test("resolves a transient instance when registered by name", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  globalContainer.register({
    token: "Bar",
    useClass: Bar
  });

  const myBar = globalContainer.resolve<Bar>("Bar");
  const myBar2 = globalContainer.resolve<Bar>("Bar");

  expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when name registered as singleton", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  globalContainer.register({
    token: "Bar",
    useClass: Bar
  }, {singleton: true});

  const myBar = globalContainer.resolve<Bar>("Bar");
  const myBar2 = globalContainer.resolve<Bar>("Bar");

  expect(myBar).toBe(myBar2);
});

test("resolves a transient instance when using token alias", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  globalContainer.register({
    token: "Bar",
    useClass: Bar
  });
  globalContainer.register({
    token: "SingletonBar",
    useToken: "Bar"
  });

  const myBar = globalContainer.resolve<Bar>("SingletonBar");
  const myBar2 = globalContainer.resolve<Bar>("SingletonBar");

  expect(myBar).not.toBe(myBar2);
});

test("resolves a singleton instance when token alias registered as singleton", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  globalContainer.register({
    token: "Bar",
    useClass: Bar
  });
  globalContainer.register({
    token: "SingletonBar",
    useToken: "Bar"
  }, {singleton: true});

  const myBar = globalContainer.resolve<Bar>("SingletonBar");
  const myBar2 = globalContainer.resolve<Bar>("SingletonBar");

  expect(myBar).toBe(myBar2);
});

test("resolves same instance when registerInstance() is used with a class", () => {
  class Bar {}
  const instance = new Bar();
  globalContainer.registerInstance(Bar, instance);

  expect(globalContainer.resolve(Bar)).toBe(instance);
})

test("resolves same instance when registerInstance() is used with a name", () => {
  class Bar {}
  const instance = new Bar();
  globalContainer.registerInstance("Test", instance);

  expect(globalContainer.resolve("Test")).toBe(instance);
})

test("registerType() allows for classes to be swapped", () => {
  class Bar {}
  class Foo {}
  globalContainer.registerType(Bar, Foo);

  expect(globalContainer.resolve(Bar) instanceof Foo).toBeTruthy();
});

test("registerType() allows for names to be registered for a given type", () => {
  class Bar {}
  globalContainer.registerType("CoolName", Bar);

  expect(globalContainer.resolve("CoolName") instanceof Bar).toBeTruthy();
});

test("executes a registered factory each time resolve is called", () => {
  let value = true;

  const provider: Provider<boolean> = {
    token: "Test",
    useFactory: () => value
  };
  globalContainer.register(provider);

  expect(globalContainer.resolve(provider.token)).toBeTruthy();
  value = false;
  expect(globalContainer.resolve(provider.token)).toBeFalsy();
});

test("allows for factories that have instance caching", () => {
  let value = true;

  const provider: Provider<boolean> = {
    token: "Test",
    useFactory: (() => {
      let instance: boolean | undefined;

      return () => {
        if (instance == undefined) {
          instance = value;
        }

        return instance;
      };
    })()
  };
  globalContainer.register(provider);

  expect(globalContainer.resolve(provider.token)).toBeTruthy();
  value = false;
  expect(globalContainer.resolve(provider.token)).toBeTruthy();
});

test("resolves anonymous classes separately", () => {
  const ctor1 = class { };
  const ctor2 = class { };

  globalContainer.registerInstance(ctor1, new ctor1());
  globalContainer.registerInstance(ctor2, new ctor2());

  expect(globalContainer.resolve(ctor1) instanceof ctor1).toBeTruthy();
  expect(globalContainer.resolve(ctor2) instanceof ctor2).toBeTruthy();
});

// --- isRegistered() ---

test("returns true for a registered type provider", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  globalContainer.register(Foo);

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered class provider", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  globalContainer.register({
    token: Foo,
    useClass: Foo
  });

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered value provider", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  globalContainer.register({
    token: Foo,
    useValue: {}
  });

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

test("returns true for a registered token provider", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  globalContainer.register({
    token: Foo,
    useToken: "Bar"
  });

  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

// --- @injectable ---

test("@injectable resolves when not using DI", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  const myValue = "test";
  const myBar = new Bar();
  myBar.value = myValue;

  const myFoo = new Foo(myBar);

  expect(myFoo.myBar.value).toBe(myValue);
});

test("@injectable resolves when using DI", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  const myFoo = globalContainer.resolve(Foo);

  expect(myFoo.myBar.value).toBe("");
});

test("@injectable resolves nested depenencies when using DI", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  @injectable()
  class FooBar {
    constructor(public myFoo: Foo) { }
  }
  const myFooBar = globalContainer.resolve(FooBar);

  expect(myFooBar.myFoo.myBar.value).toBe("");
});

test("@injectable preserves static members", () => {
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

test("@injectable handles optional params", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  @injectable()
  class MyOptional {
    constructor(public myFoo?: Foo) { }
  }

  const myOptional = globalContainer.resolve(MyOptional);
  expect(myOptional.myFoo instanceof Foo).toBeTruthy();
});

test("passes through the given params", () => {
  @injectable()
  class MyViewModel {
    constructor(public a: any, public b: any, public c: any) { }
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

test("doesn't blow up with empty args", () => {
  @registry()
  class RegisteringFoo { }

  expect(() => new RegisteringFoo()).not.toThrow();
});

test("registers by type provider", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @registry([Bar])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(globalContainer.isRegistered(Bar)).toBeTruthy();
});

test("registers by class provider", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  const provider: Provider<Bar> = {
    token: "IBar",
    useClass: Bar
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(globalContainer.isRegistered(provider.token)).toBeTruthy();
});

test("registers by value provider", () => {
  const provider: Provider<any> = {
    token: "IBar",
    useValue: {}
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(globalContainer.isRegistered(provider.token)).toBeTruthy();
});

test("registers by token provider", () => {
  const provider: Provider<any> = {
    token: "IBar",
    useToken: "IFoo"
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(globalContainer.isRegistered(provider.token)).toBeTruthy();
});

test("registers by factory provider", () => {
  const provider: Provider<any> = {
    token: "IBar",
    useFactory: (globalContainer) => globalContainer.resolve(Bar)
  };

  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(globalContainer.isRegistered(provider.token)).toBeTruthy();
});

test("registers mixed types", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  const provider: Provider<Bar> = {
    token: "IBar",
    useClass: Bar
  };

  @registry([provider, Foo])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(globalContainer.isRegistered(provider.token)).toBeTruthy();
  expect(globalContainer.isRegistered(Foo)).toBeTruthy();
});

// --- @inject ---

test("allows interfaces to be resolved from the constructor with injection token", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  @registry([Bar])
  class FooWithInterface {
    constructor( @inject(Bar) public myBar: IBar) { }
  }

  const myFoo = globalContainer.resolve(FooWithInterface);

  expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

test("allows interfaces to be resolved from the constructor with just a name", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  @registry([{
    token: "IBar",
    useClass: Bar
  }])
  class FooWithInterface {
    constructor( @inject("IBar") public myBar: IBar) { }
  }

  const myFoo = globalContainer.resolve(FooWithInterface);

  expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

// --- factories ---

test("instanceCachingFactory caches the returned instance", () => {
  const factory = instanceCachingFactory(() => { });

  expect(factory(globalContainer)).toBe(factory(globalContainer));
});

test("instanceCachingFactory caches the returned instance even when there is branching logic in the factory", () => {
  const instanceA = {};
  const instanceB = {};
  let useA = true;

  const factory = instanceCachingFactory(() => useA ? instanceA : instanceB);

  expect(factory(globalContainer)).toBe(instanceA);
  useA = false;
  expect(factory(globalContainer)).toBe(instanceA);
});

test("predicateAwareClassFactory correctly switches the returned instance with caching on", () => {
  class A { }
  class B { }
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B);

  expect(factory(globalContainer) instanceof A).toBeTruthy();
  useA = false;
  expect(factory(globalContainer) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns the same instance each call with caching on", () => {
  class A { }
  class B { }
  const factory = predicateAwareClassFactory(() => true, A, B);

  expect(factory(globalContainer)).toBe(factory(globalContainer));
});

test("predicateAwareClassFactory correctly switches the returned instance with caching off", () => {
  class A { }
  class B { }
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B, false);

  expect(factory(globalContainer) instanceof A).toBeTruthy();
  useA = false;
  expect(factory(globalContainer) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns new instances each call with caching off", () => {
  class A { }
  class B { }
  const factory = predicateAwareClassFactory(() => true, A, B, false);

  expect(factory(globalContainer)).not.toBe(factory(globalContainer));
});
