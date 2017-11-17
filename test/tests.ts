import test, {GenericTest, Context} from "ava";
import { instanceCachingFactory, predicateAwareClassFactory } from "../src/factories";
import { Provider, InjectionToken } from "../src/Providers";
import { DependencyContainer } from "../src/types";

const proxyquire = require("proxyquire").noCallThru();
const requireUncached = require("require-uncached");

interface IBar {
  value: string;
}

function testWithContainer(
  name: string,
  run: (container: DependencyContainer, decorators: { inject: (token: InjectionToken<any>) => any, injectable: () => any, registry: (...args: any[]) => any }) => GenericTest<Context<any>>) {
  const container = requireUncached("../src/DependencyContainer").default;
  const {injectable, inject, registry} = proxyquire("../src/decorators", {
    "./DependencyContainer": {default: container}
  })
  test(name, run(container, {injectable, inject, registry}));
}

// --- resolve() ---

testWithContainer("fails to resolve unregistered dependency by name", (container) => t => {
  t.throws(() => {
    container.resolve("NotRegistered");
  });
});

testWithContainer("resolves transient instances when dependencies aren't registered", (container, {injectable}) => t => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  const myBar = container.resolve(Bar);
  myBar.value = "test";
  const myBar2 = container.resolve(Bar);

  t.not(myBar.value, myBar2.value);
});

testWithContainer("resolves a singleton for registered dependencies by class", (container, {injectable}) => t => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  container.register(Bar);

  const myBar = container.resolve(Bar);
  myBar.value = "test";
  const myBar2 = container.resolve(Bar);

  t.is(myBar.value, myBar2.value);
});

testWithContainer("resolves a singleton for registered dependencies by name", (container, {injectable}) => t => {
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

  t.is(myBar.value, myBar2.value);
});

testWithContainer("resolves registered dependencies by token", (container, {injectable}) => t => {
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
  t.true(myBar instanceof Bar);
});

testWithContainer("executes a registered factory each time resolve is called", (container) => t => {
  let value = true;

  const provider: Provider<boolean> = {
    token: "Test",
    useFactory: () => value
  };
  container.register(provider);

  t.true(container.resolve(provider.token));
  value = false;
  t.false(container.resolve(provider.token));
});

testWithContainer("allows for factories that have instance caching", (container) => t => {
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

  t.true(container.resolve(provider.token));
  value = false;
  t.true(container.resolve(provider.token));
});

testWithContainer("resolves two functionally equivalent constructors as separate singletons", (container) => t => {
  const ctor1 = class { };
  const ctor2 = class { };

  container.register(ctor1);
  container.register(ctor2);

  const instance1a = container.resolve(ctor1);
  const instance1b = container.resolve(ctor1);
  const instance2a = container.resolve(ctor2);
  const instance2b = container.resolve(ctor2);

  t.true(instance1a instanceof ctor1);
  t.true(instance1b instanceof ctor1);
  t.true(instance2a instanceof ctor2);
  t.true(instance2b instanceof ctor2);
  t.is(instance1a, instance1b);
  t.is(instance2a, instance2b);
});

// --- isRegistered() ---

testWithContainer("returns true for a registered type provider", (container, {injectable}) => t => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  container.register(Foo);

  t.true(container.isRegistered(Foo));
});

testWithContainer("returns true for a registered class provider", (container, {injectable}) => t => {
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

  t.true(container.isRegistered(Foo));
});

testWithContainer("returns true for a registered value provider", (container, {injectable}) => t => {
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

  t.true(container.isRegistered(Foo));
});

testWithContainer("returns true for a registered token provider", (container, {injectable}) => t => {
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

  t.true(container.isRegistered(Foo));
});

// --- @injectable ---

testWithContainer("resolves when not using DI", (_container, {injectable}) => t => {
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

  t.is(myFoo.myBar.value, myValue);
});

testWithContainer("resolves when using DI", (container, {injectable}) => t => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }

  @injectable()
  class Foo {
    constructor(public myBar: Bar) { }
  }
  const myFoo = container.resolve(Foo);

  t.is(myFoo.myBar.value, "");
});

testWithContainer("resolves nested depenencies when using DI", (container, {injectable}) => t => {
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

  t.is(myFooBar.myFoo.myBar.value, "");
});

testWithContainer("preserves static members", (_container, {injectable}) => t => {
  const value = "foobar";

  @injectable()
  class MyStatic {
    public static testVal = value;

    public static testFunc(): string {
      return value;
    }
  }

  t.is(MyStatic.testFunc(), value);
  t.is(MyStatic.testVal, value);
});

testWithContainer("works when the @injectable is a polymorphic ancestor (root node)", (container, {injectable}) => t => {
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

    constructor(public foo: Foo | null = null) {
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

  t.true(instance.foo != undefined);
  t.is(instance.a, a);
  t.is(instance.b, b);
});

testWithContainer("works when the @injectable is a polymorphic ancestor (middle node)", (container, {injectable}) => t => {
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

  t.true(instance.foo != undefined);
  t.is(instance.a, a);
  t.is(instance.b, b);
  t.is(instance.c, c);
});

testWithContainer("handles optional params", (container, {injectable}) => t => {
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
  t.true(myOptional.myFoo instanceof Foo);
});

testWithContainer("passes through the given params", (_container, {injectable}) => t => {
  @injectable()
  class MyViewModel {
    constructor(public a: any, public b: any, public c: any) { }
  }

  const a = {};
  const b = {};
  const c = {};
  const instance = new MyViewModel(a, b, c);

  t.is(instance.a, a);
  t.is(instance.b, b);
  t.is(instance.c, c);
});

testWithContainer("resolves the not given params using DI", (_container, {injectable}) => t => {
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

  t.is(instance.a, a);
  t.is(instance.b, b);
  t.is(instance.c, c);
  t.true(instance.d instanceof Bar);
  t.true(instance.e instanceof Foo);
});

testWithContainer("works twice in a row", (_container, {injectable}) => t => {
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
  t.true(instance.d instanceof Bar);
  t.true(instance.e instanceof Foo);

  const instance2 = new MyViewModel({}, {}, {});
  t.true(instance2.d instanceof Bar);
  t.true(instance2.e instanceof Foo);
});

// --- @registry ---

testWithContainer("doesn't blow up with empty args", (_container, {registry}) => t => {
  @registry()
  class RegisteringFoo { }

  t.notThrows(() => new RegisteringFoo());
});

testWithContainer("registers by type provider", (container, {injectable, registry}) => t => {
  @injectable()
  class Bar implements IBar {
    public value: string = "";
  }
  @registry([Bar])
  class RegisteringFoo { }

  new RegisteringFoo();

  t.true(container.isRegistered(Bar));
});

testWithContainer("registers by class provider", (container, {injectable, registry}) => t => {
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

  t.true(container.isRegistered(provider.token));
});

testWithContainer("registers by value provider", (container, {registry}) => t => {
  const provider: Provider<any> = {
    token: "IBar",
    useValue: {}
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  t.true(container.isRegistered(provider.token));
});

testWithContainer("registers by token provider", (container, {registry}) => t => {
  const provider: Provider<any> = {
    token: "IBar",
    useToken: "IFoo"
  };

  @registry([provider])
  class RegisteringFoo { }

  new RegisteringFoo();

  t.true(container.isRegistered(provider.token));
});

testWithContainer("registers by factory provider", (container, {injectable, registry}) => t => {
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

  t.true(container.isRegistered(provider.token));
});

testWithContainer("registers mixed types", (container, {injectable, registry}) => t => {
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

  t.true(container.isRegistered(provider.token));
  t.true(container.isRegistered(Foo));
});

// --- @inject ---

testWithContainer("allows interfaces to be resolved from the constructor with injection token", (container, {inject, injectable, registry}) => t => {
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

  t.is(myFoo.myBar.value, myBar.value);
});

testWithContainer("allows interfaces to be resolved from the constructor with just a name", (container, {inject, injectable, registry}) => t => {

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

  t.is(myFoo.myBar.value, myBar.value);
});

// --- factories ---

testWithContainer("instanceCachingFactory caches the returned instance", (container) => t => {
  const factory = instanceCachingFactory(() => { });

  t.is(factory(container), factory(container));
});

testWithContainer("instanceCachingFactory caches the returned instance even when there is branching logic in the factory", (container) => t => {
  const instanceA = {};
  const instanceB = {};
  let useA = true;

  const factory = instanceCachingFactory(() => useA ? instanceA : instanceB);

  t.is(factory(container), instanceA);
  useA = false;
  t.is(factory(container), instanceA);
});

testWithContainer("predicateAwareClassFactory correctly switches the returned instance with caching on", (container) => t => {
  class A { }
  class B { }
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B);

  t.true(factory(container) instanceof A);
  useA = false;
  t.true(factory(container) instanceof B);
});

testWithContainer("predicateAwareClassFactory returns the same instance each call with caching on", (container) => t => {
  class A { }
  class B { }
  const factory = predicateAwareClassFactory(() => true, A, B);

  t.is(factory(container), factory(container));
});

testWithContainer("predicateAwareClassFactory correctly switches the returned instance with caching off", (container) => t => {
  class A { }
  class B { }
  let useA = true;
  const factory = predicateAwareClassFactory(() => useA, A, B, false);

  t.true(factory(container) instanceof A);
  useA = false;
  t.true(factory(container) instanceof B);
});

testWithContainer("predicateAwareClassFactory returns new instances each call with caching off", (container) => t => {
  class A { }
  class B { }
  const factory = predicateAwareClassFactory(() => true, A, B, false);

  t.not(factory(container), factory(container));
});
