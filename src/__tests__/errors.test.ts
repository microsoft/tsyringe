import {instance as globalContainer} from "../dependency-container";
import {inject, injectable} from "../decorators";
import {A01} from "./fixtures/01-test-case-A01-injects-B01";
import errorMatch from "./utils/error-match";
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
    errorMatch([
      /Cannot inject the dependency "b" at position #1 of "A" constructor\. Reason:/,
      /Cannot inject the dependency "c" at position #0 of "B" constructor\. Reason:/,
      /Cannot inject the dependency "s" at position #0 of "C" constructor\. Reason:/,
      /TypeInfo not known for "Object"/
    ])
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
    errorMatch([
      /Cannot inject the dependency "j" at position #0 of "A" constructor\. Reason:/,
      /Attempted to resolve unregistered dependency token: "missing"/
    ])
  );
});

test("Detect circular dependency", () => {
  expect(() => {
    globalContainer.resolve(A01);
  }).toThrow(
    errorMatch([
      /Cannot inject the dependency "b" at position #0 of "A01" constructor\. Reason:/,
      /Cannot inject the dependency "a" at position #0 of "B01" constructor\. Reason:/,
      /Attempted to construct an undefined constructor. Could means a circular dependency problem./
    ])
  );
});
