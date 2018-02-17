import {instance as globalContainer} from "../src/dependency-container";

test("child container resolves even when parent doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  const container = globalContainer.createChildContainer();
  container.register("IFoo", {useClass: Foo});

  const myFoo = container.resolve<Foo>("IFoo");

  expect(myFoo instanceof Foo).toBeTruthy();
});

test("child container resolves using parents' registration when child container doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  globalContainer.register("IFoo", {useClass: Foo});
  const container = globalContainer.createChildContainer();

  const myFoo = container.resolve<Foo>("IFoo");

  expect(myFoo instanceof Foo).toBeTruthy();
});
