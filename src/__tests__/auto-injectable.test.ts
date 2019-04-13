import {autoInjectable, injectable, singleton} from "../decorators";
import {instance as globalContainer} from "../dependency-container";

afterEach(() => {
  globalContainer.reset();
});

test("@autoInjectable allows for injection to be performed without using .resolve()", () => {
  class Bar {}
  @autoInjectable()
  class Foo {
    constructor(public myBar?: Bar) {}
  }

  const myFoo = new Foo();

  expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

test("@autoInjectable allows for parameters to be specified manually", () => {
  class Bar {}
  @autoInjectable()
  class Foo {
    constructor(public myBar?: Bar) {}
  }

  const myBar = new Bar();
  const myFoo = new Foo(myBar);

  expect(myFoo.myBar).toBe(myBar);
});

test("@autoInjectable injects parameters beyond those specified manually", () => {
  class Bar {}
  class FooBar {}
  @autoInjectable()
  class Foo {
    constructor(public myFooBar: FooBar, public myBar?: Bar) {}
  }

  const myFooBar = new FooBar();
  const myFoo = new Foo(myFooBar);

  expect(myFoo.myFooBar).toBe(myFooBar);
  expect(myFoo.myBar instanceof Bar).toBeTruthy();
});

test("@autoInjectable works when the @autoInjectable is a polymorphic ancestor", () => {
  class Foo {
    constructor() {}
  }

  @autoInjectable()
  class Ancestor {
    constructor(public myFoo?: Foo) {}
  }

  class Child extends Ancestor {
    constructor() {
      super();
    }
  }

  const instance = new Child();

  expect(instance.myFoo instanceof Foo).toBeTruthy();
});

test("@autoInjectable classes keep behavior from their ancestor's constructors", () => {
  const a = 5;
  const b = 4;
  class Foo {
    constructor() {}
  }

  @autoInjectable()
  class Ancestor {
    public a: number;
    constructor(public myFoo?: Foo) {
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

  const instance = new Child();

  expect(instance.a).toBe(a);
  expect(instance.b).toBe(b);
});

test("@autoInjectable classes resolve their @injectable dependencies", () => {
  class Foo {}
  @injectable()
  class Bar {
    constructor(public myFoo: Foo) {}
  }
  @autoInjectable()
  class FooBar {
    constructor(public myBar?: Bar) {}
  }

  const myFooBar = new FooBar();

  expect(myFooBar.myBar!.myFoo instanceof Foo).toBeTruthy();
});

test("@autoInjectable throws a clear error if a dependency can't be resolved.", () => {
  interface Bar {
    someval: string;
  }
  @autoInjectable()
  class Foo {
    constructor(public myBar?: Bar) {}
  }

  expect(() => new Foo()).toThrow(
    /Cannot inject the dependency myBar of Foo constructor. TypeInfo/
  );
});

test("@autoInjectable works with @singleton", () => {
  class Bar {}

  @singleton()
  @autoInjectable()
  class Foo {
    constructor(public bar: Bar) {}
  }

  const instance1 = globalContainer.resolve(Foo);
  const instance2 = globalContainer.resolve(Foo);

  expect(instance1).toBe(instance2);
  expect(instance1.bar).toBe(instance2.bar);
});
