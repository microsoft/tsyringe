import {instance as globalContainer} from "../dependency-container";
import scoped from "../decorators/scoped";
import {injectable, singleton} from "../decorators";

afterEach(() => {
  globalContainer.reset();
});

test("create a new instance of requestScope'd service within a new requestScope", async () => {
  @scoped()
  class X {}

  @injectable()
  class B {
    constructor(public x: X) {}
  }

  @injectable()
  class C {
    constructor(public x: X) {}
  }

  const b = globalContainer.resolve(B);
  const cOuter = globalContainer.resolve(C);
  expect(b.x).toBe(cOuter.x);

  await globalContainer.enterScope(requestScope => {
    const cInner = requestScope.resolve(C);
    expect(b.x).not.toBe(cInner.x);
  });
});

test("the requestScope'd service within a new requestScope is persisted for the duration of the scope", async () => {
  @scoped()
  class X {}

  await globalContainer.enterScope(requestScope1 => {
    const x1 = requestScope1.resolve(X);
    const x2 = requestScope1.resolve(X);

    expect(x1).toBeTruthy();
    expect(x2).toBeTruthy();
    expect(x1).toBe(x2);

    requestScope1.enterScope(requestScope2 => {
      const x3 = requestScope2.resolve(X);

      expect(x3).toBeTruthy();
      expect(x1).not.toBe(x3);
    });
  });
});

test("singletons are persisted between within a requestScope", async () => {
  @singleton()
  class Foo {}

  const fooOuter = globalContainer.resolve(Foo);

  expect(fooOuter).toBeTruthy();

  await globalContainer.enterScope(requestScope => {
    const fooInner = requestScope.resolve(Foo);
    expect(fooOuter).toBe(fooInner);
  });
});
