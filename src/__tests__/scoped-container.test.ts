/* eslint-disable @typescript-eslint/interface-name-prefix */

import {instance as globalContainer} from "../dependency-container";
import {Lifetime} from "../types";

beforeEach(() => {
  globalContainer.reset();
});

test("creates a new instance of requested service within a scope using class provider", () => {
  class Foo {}

  globalContainer.register(Foo, {useClass: Foo}, {lifetime: Lifetime.SCOPED});

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

  globalContainer.register("IBar", {useClass: Foo});
  globalContainer.register(
    Foo,
    {useToken: "IBar"},
    {lifetime: Lifetime.SCOPED}
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
