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
    new RegExp(
      [
        /Cannot inject the dependency "b" at position #1 of "A" constructor\. Reason:/,
        /Cannot inject the dependency "c" at position #0 of "B" constructor\. Reason:/,
        /Cannot inject the dependency "s" at position #0 of "C" constructor\. Reason:/,
        /TypeInfo not known for "Object"/
      ]
        .map(x => x.source)
        .join("\\s+")
    )
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
    new RegExp(
      [
        /Cannot inject the dependency "j" at position #0 of "A" constructor\. Reason:/,
        /Attempted to resolve unregistered dependency token: "missing"/
      ]
        .map(x => x.source)
        .join("\\s+")
    )
  );
});
