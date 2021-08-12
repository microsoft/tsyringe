/* eslint-disable @typescript-eslint/no-empty-interface */

import {instance as globalContainer} from "../dependency-container";

afterEach(() => {
  globalContainer.reset();
});

test("child container resolves even when parent doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  const container = globalContainer.createChildContainer();
  container.register("IFoo", {useClass: Foo});

  const myFoo = container.resolve<Foo>("IFoo");

  expect(myFoo instanceof Foo).toBeTruthy();
});

test("child container resolves using parent's registration when child container doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  globalContainer.register("IFoo", {useClass: Foo});
  const container = globalContainer.createChildContainer();

  const myFoo = container.resolve<Foo>("IFoo");

  expect(myFoo instanceof Foo).toBeTruthy();
});

test("child container resolves all even when parent doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  const container = globalContainer.createChildContainer();
  container.register("IFoo", {useClass: Foo});

  const myFoo = container.resolveAll<IFoo>("IFoo");

  expect(Array.isArray(myFoo)).toBeTruthy();
  expect(myFoo.length).toBe(1);
  expect(myFoo[0] instanceof Foo).toBeTruthy();
});

test("child container resolves all using parent's registration when child container doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  globalContainer.register("IFoo", {useClass: Foo});
  const container = globalContainer.createChildContainer();

  const myFoo = container.resolveAll<IFoo>("IFoo");

  expect(Array.isArray(myFoo)).toBeTruthy();
  expect(myFoo.length).toBe(1);
  expect(myFoo[0] instanceof Foo).toBeTruthy();
});

test("isRegistered check parent containers recursively", () => {
  class A {}

  globalContainer.registerType(A, A);
  const child = globalContainer.createChildContainer();

  expect(globalContainer.isRegistered(A)).toBeTruthy();
  expect(child.isRegistered(A)).toBeFalsy();
  expect(child.isRegistered(A, true)).toBeTruthy();
});
