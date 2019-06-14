/* eslint-disable @typescript-eslint/interface-name-prefix */

import {instance as globalContainer} from "../dependency-container";
import {Lifetime} from "../types";
import scoped from "../decorators/scoped";

beforeEach(() => {
  globalContainer.reset();
});

test("creates a new instance of requested service within a scope using class provider", () => {
  class Foo {}

  globalContainer.registerScoped(Foo, Foo);

  const foo1 = globalContainer.resolve(Foo);

  expect(foo1).toBeInstanceOf(Foo);

  const scope = globalContainer.createScope();
  const foo2 = scope.resolve(Foo);
  const foo3 = scope.resolve(Foo);

  expect(foo2).toBeInstanceOf(Foo);
  expect(foo3).toBeInstanceOf(Foo);
  expect(foo1 === foo2).toBeFalsy();
  expect(foo2 === foo3).toBeTruthy();
});

test("creates a new instance of requested service within a scope using token provider", () => {
  interface IBar {
    void: string;
  }
  class Foo implements IBar {
    void: string = "";
  }

  globalContainer.registerScoped("IBar", Foo);
  globalContainer.register(
    Foo,
    {useToken: "IBar"},
    {lifetime: Lifetime.TRANSIENT}
  );

  const foo1 = globalContainer.resolve(Foo);

  expect(foo1).toBeInstanceOf(Foo);

  const scope = globalContainer.createScope();
  const foo2 = scope.resolve(Foo);
  const foo3 = scope.resolve(Foo);

  expect(foo2).toBeInstanceOf(Foo);
  expect(foo3).toBeInstanceOf(Foo);
  expect(foo1 === foo2).toBeFalsy();
  expect(foo2 === foo3).toBeTruthy();
});

test("should not create a new instance of requested singleton service", () => {
  class Bar {}

  globalContainer.registerSingleton(Bar, Bar);

  const bar1 = globalContainer.resolve(Bar);

  expect(bar1).toBeInstanceOf(Bar);

  const scope = globalContainer.createScope();
  const bar2 = scope.resolve(Bar);

  expect(bar2).toBeInstanceOf(Bar);
  expect(bar1 === bar2).toBeTruthy();
});

test("allows multiple scope levels", () => {
  class Bar {}

  globalContainer.registerScoped(Bar, Bar);
  const bar = globalContainer.resolve(Bar);

  const scope1 = globalContainer.createScope();
  const bar1 = scope1.resolve(Bar);

  const scope2 = scope1.createScope();
  const bar2 = scope2.resolve(Bar);

  expect(bar === bar1).toBeFalsy();
  expect(bar === bar2).toBeFalsy();
  expect(bar1 === bar2).toBeFalsy();

  expect(bar === globalContainer.resolve(Bar)).toBeFalsy();
  expect(bar1 === scope1.resolve(Bar)).toBeTruthy();
  expect(bar2 === scope2.resolve(Bar)).toBeTruthy();
});

test("@scoped decorator registers class as scoped", () => {
  @scoped()
  class Foo {}

  const foo1 = globalContainer.resolve(Foo);

  expect(foo1).toBeInstanceOf(Foo);

  const scope = globalContainer.createScope();
  const foo2 = scope.resolve(Foo);
  const foo3 = scope.resolve(Foo);

  expect(foo2).toBeInstanceOf(Foo);
  expect(foo3).toBeInstanceOf(Foo);
  expect(foo1 === foo2).toBeFalsy();
  expect(foo2 === foo3).toBeTruthy();
});

test("@scoped decorator registers class as scoped using custom token", () => {
  @scoped("Foo")
  class Foo {}

  const foo1 = globalContainer.resolve("Foo");

  expect(foo1).toBeInstanceOf(Foo);

  const scope = globalContainer.createScope();
  const foo2 = scope.resolve("Foo");
  const foo3 = scope.resolve("Foo");

  expect(foo2).toBeInstanceOf(Foo);
  expect(foo3).toBeInstanceOf(Foo);
  expect(foo1 === foo2).toBeFalsy();
  expect(foo2 === foo3).toBeTruthy();
});
