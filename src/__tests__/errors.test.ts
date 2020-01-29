import {instance as globalContainer} from "../dependency-container";
import {inject, injectable} from "../decorators";

afterEach(() => {
  globalContainer.reset();
});

test("Error message composition", () => {
  class Ok {}

  @injectable()
  class C {
    constructor(public s: any) {}
  }

  @injectable()
  class B {
    constructor(public c: C) {}
  }

  @injectable()
  class A {
    constructor(public d: Ok, public b: B) {}
  }
  expect(() => {
    globalContainer.resolve(A);
  }).toThrow(
    /Cannot inject the dependency "b" at position #1 of "A" constructor. Reason:\s+Cannot inject the dependency "c" at position #0 of "B" constructor. Reason:\s+Cannot inject the dependency "s" at position #0 of "C" constructor. Reason:\s+TypeInfo not known for "Object"/
  );
});

test("Param position", () => {
  @injectable()
  class A {
    constructor(@inject("missing") public j: any) {}
  }
  expect(() => {
    globalContainer.resolve(A);
  }).toThrow(
    /Cannot inject the dependency "j" at position #0 of "A" constructor. Reason:\s+Attempted to resolve unregistered dependency token: "missing"/
  );
});
