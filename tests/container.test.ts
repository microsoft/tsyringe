import { instanceCachingFactory, predicateAwareClassFactory } from "../src/factories";
import { Provider } from "../src/providers";
import { inject, injectable, registry } from "../src/decorators";
import container from "../src/dependency-container";

interface IBar {
  value: string;
}

afterEach(() => {
  container.reset();
});

// --- resolve() ---

test("fails to resolve unregistered dependency by name", () => {
  expect(() => {
    container.resolve("NotRegistered");
  }).toThrow();
});

test("resolves transient instances when dependencies aren't registered", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  const myBar = container.resolve(Bar);
  myBar.value = "test";
  const myBar2 = container.resolve(Bar);

  expect(myBar.value).not.toBe(myBar2.value);
});

test("resolves a singleton for registered dependencies by class", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  container.register(Bar);

  const myBar = container.resolve(Bar);
  myBar.value = "test";
  const myBar2 = container.resolve(Bar);

  expect(myBar.value).toBe(myBar2.value);
});

test("resolves a singleton for registered dependencies by name", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  container.register({
    token: "Bar",
    useClass: Bar
  });

  const myBar = container.resolve<Bar>("Bar");
  myBar.value = "test";

  const myBar2 = container.resolve<Bar>("Bar");

  expect(myBar.value).toBe(myBar2.value);
});

test("resolves registered dependencies by token", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  const provider: Provider<Bar> = {
    token: Bar,
    useClass: Bar
  };
  container.register(provider);

  const myBar = container.resolve(Bar);
  expect(myBar instanceof Bar).toBeTruthy();
});

test("executes a registered factory each time resolve is called", () => {
  let value = true;

  const provider: Provider<boolean> = {
    token: "Test",
    useFactory: () => value
  };
  container.register(provider);

  expect(container.resolve(provider.token)).toBeTruthy();
  value = false;
  expect(container.resolve(provider.token)).toBeFalsy();
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
  container.register(provider);

  expect(container.resolve(provider.token)).toBeTruthy();
  value = false;
  expect(container.resolve(provider.token)).toBeTruthy();
});

test("resolves two functionally equivalent constructors as separate singletons", () => {
  const ctor1 = class { };
  const ctor2 = class { };

  container.register(ctor1);
  container.register(ctor2);

  const instance1a = container.resolve(ctor1);
  const instance1b = container.resolve(ctor1);
  const instance2a = container.resolve(ctor2);
  const instance2b = container.resolve(ctor2);

  expect(instance1a instanceof ctor1).toBeTruthy();
  expect(instance1b instanceof ctor1).toBeTruthy();
  expect(instance2a instanceof ctor2).toBeTruthy();
  expect(instance2b instanceof ctor2).toBeTruthy();
  expect(instance1a).toBe(instance1b);
  expect(instance2a).toBe(instance2b);
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
  container.register(Foo);

  expect(container.isRegistered(Foo)).toBeTruthy();
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
  container.register({
    token: Foo,
    useClass: Foo
  });

  expect(container.isRegistered(Foo)).toBeTruthy();
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
  container.register({
    token: Foo,
    useValue: {}
  });

  expect(container.isRegistered(Foo)).toBeTruthy();
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
  container.register({
    token: Foo,
    useToken: "Bar"
  });

  expect(container.isRegistered(Foo)).toBeTruthy();
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
  const myFoo = container.resolve(Foo);

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
  const myFooBar = container.resolve(FooBar);

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

test("@injectable works when the @injectable is a polymorphic ancestor (root node)", () => {
  const a = 5;
  const b = 10;

  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }

  @injectable()
  class Ancestor {
    public a: number;

    constructor(public foo?: Foo) {
      this.a = a;
    }
  }

  class Child extends Ancestor {
    public b: number;

    constructor() {
      super();

      this.b = b;
    }
  }

  const instance = container.resolve(Child);

  expect(instance.foo instanceof Foo).toBeTruthy();
  expect(instance.a).toBe(a);
  expect(instance.b).toBe(b);
});

test("@injectable works when the @injectable is a polymorphic ancestor (middle node)", () => {
  const a = 5;
  const b = 10;
  const c = 15;

  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }

  class Ancestor {
    public a: number;

    constructor() {
      this.a = a;
    }
  }

  @injectable()
  class Parent extends Ancestor {
    public b: number;

    constructor(public foo: Foo | null = null) {
      super();

      this.b = b;
    }
  }

  class Child extends Parent {
    public c: number;

    constructor() {
      super();

      this.c = c;
    }
  }

  const instance = container.resolve(Child);

  expect(instance.foo != undefined).toBeTruthy();
  expect(instance.a).toBe(a);
  expect(instance.b).toBe(b);
  expect(instance.c).toBe(c);
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

  const myOptional = container.resolve(MyOptional);
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

test("@injectable resolves the not given params using DI", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  @injectable()
  class MyViewModel {
    constructor(public a: any, public b: any, public c: any, public d?: Bar, public e?: Foo) { }
  }

  const a = {};
  const b = {};
  const c = {};
  const instance = new MyViewModel(a, b, c);

  expect(instance.a).toBe(a);
  expect(instance.b).toBe(b);
  expect(instance.c).toBe(c);
  expect(instance.d instanceof Bar).toBeTruthy();
  expect(instance.e instanceof Foo).toBeTruthy();
});

test("@injectable works twice in a row", () => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  @injectable()
  class MyViewModel {
    constructor(public a: any, public b: any, public c: any, public d?: Bar, public e?: Foo) { }
  }

  const instance = new MyViewModel({}, {}, {});
  expect(instance.d instanceof Bar).toBeTruthy();
  expect(instance.e instanceof Foo).toBeTruthy();

  const instance2 = new MyViewModel({}, {}, {});
  expect(instance2.d instanceof Bar).toBeTruthy();
  expect(instance2.e instanceof Foo).toBeTruthy();
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

  expect(container.isRegistered(Bar)).toBeTruthy();
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

  expect(container.isRegistered(provider.token)).toBeTruthy();
});

test("registers by value provider", () => {
  const provider: Provider<any> = {
    token: "IBar",
    useValue: {}
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(container.isRegistered(provider.token)).toBeTruthy();
});

test("registers by token provider", () => {
  const provider: Provider<any> = {
    token: "IBar",
    useToken: "IFoo"
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(container.isRegistered(provider.token)).toBeTruthy();
});

test("registers by factory provider", () => {
  const provider: Provider<any> = {
    token: "IBar",
    useFactory: (container) => container.resolve(Bar)
  };

  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  expect(container.isRegistered(provider.token)).toBeTruthy();
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

  expect(container.isRegistered(provider.token)).toBeTruthy();
  expect(container.isRegistered(Foo)).toBeTruthy();
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

  const myFoo = container.resolve(FooWithInterface);
  const myBar = container.resolve(Bar);
  myBar.value = "test";

  expect(myFoo.myBar.value).toBe(myBar.value);
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

  const myFoo = container.resolve(FooWithInterface);
  const myBar = container.resolve<Bar>("IBar");
  myBar.value = "test";

  expect(myFoo.myBar.value).toBe(myBar.value);
});

// --- factories ---

test("instanceCachingFactory caches the returned instance", () => {
  const factory = instanceCachingFactory(() => { });

  expect(factory(container)).toBe(factory(container));
});

test("instanceCachingFactory caches the returned instance even when there is branching logic in the factory", () => {
  const instanceA = {};
  const instanceB = {};
  let useA = true;

  const factory = instanceCachingFactory(() => useA ? instanceA : instanceB);

  expect(factory(container)).toBe(instanceA);
  useA = false;
  expect(factory(container)).toBe(instanceA);
});

test("predicateAwareClassFactory correctly switches the returned instance with caching on", () => {
  class A { }
  class B { }
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B);

  expect(factory(container) instanceof A).toBeTruthy();
  useA = false;
  expect(factory(container) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns the same instance each call with caching on", () => {
  class A { }
  class B { }
  const factory = predicateAwareClassFactory(() => true, A, B);

  expect(factory(container)).toBe(factory(container));
});

test("predicateAwareClassFactory correctly switches the returned instance with caching off", () => {
  class A { }
  class B { }
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B, false);

  expect(factory(container) instanceof A).toBeTruthy();
  useA = false;
  expect(factory(container) instanceof B).toBeTruthy();
});

test("predicateAwareClassFactory returns new instances each call with caching off", () => {
  class A { }
  class B { }
  const factory = predicateAwareClassFactory(() => true, A, B, false);

  expect(factory(container)).not.toBe(factory(container));
});
