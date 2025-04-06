import injectable from "../decorators/injectable";
import {instance as globalContainer} from "../dependency-container";
import Lifecycle from "../types/lifecycle";
import scoped from "../decorators/scoped";

describe("Scoped registrations", () => {
  describe("ResolutionScoped", () => {
    afterEach(() => {
      globalContainer.reset();
    });

    it("uses the same instance during the same resolution chain", () => {
      class X {}

      @injectable()
      class B {
        constructor(public x: X) {}
      }

      @injectable()
      class C {
        constructor(public x: X) {}
      }

      @injectable()
      class A {
        constructor(
          public b: B,
          public c: C
        ) {}
      }

      globalContainer.register(
        X,
        {useClass: X},
        {lifecycle: Lifecycle.ResolutionScoped}
      );
      const a = globalContainer.resolve(A);

      expect(a.b.x).toBe(a.c.x);
    });

    it("uses different instances for difference resolution chains", () => {
      class X {}

      @injectable()
      class B {
        constructor(public x: X) {}
      }

      @injectable()
      class A {
        constructor(public b: B) {}
      }

      globalContainer.register(
        X,
        {useClass: X},
        {lifecycle: Lifecycle.ResolutionScoped}
      );
      const a = globalContainer.resolve(A);
      const b = globalContainer.resolve(A);

      expect(a.b.x).not.toBe(b.b.x);
    });
  });

  describe("ContainerScoped", () => {
    afterEach(() => {
      globalContainer.reset();
    });

    it("creates a new instance of requested service within a scope using class provider", () => {
      class Foo {}

      debugger;
      globalContainer.register(Foo, Foo, {
        lifecycle: Lifecycle.ContainerScoped
      });

      const foo1 = globalContainer.resolve(Foo);

      expect(foo1).toBeInstanceOf(Foo);

      const scope = globalContainer.createChildContainer();
      const foo2 = scope.resolve(Foo);
      const foo3 = scope.resolve(Foo);

      expect(foo2).toBeInstanceOf(Foo);
      expect(foo3).toBeInstanceOf(Foo);
      expect(foo1 === foo2).toBeFalsy();
      expect(foo2 === foo3).toBeTruthy();
    });

    it("creates a new instance of requested service within a scope using token provider", () => {
      interface IBar {
        void: string;
      }
      class Foo implements IBar {
        void = "";
      }

      globalContainer.register("IBar", Foo, {
        lifecycle: Lifecycle.ContainerScoped
      });
      globalContainer.register(
        Foo,
        {useToken: "IBar"},
        {
          lifecycle: Lifecycle.Transient
        }
      );

      const foo1 = globalContainer.resolve(Foo);

      expect(foo1).toBeInstanceOf(Foo);

      const scope = globalContainer.createChildContainer();
      const foo2 = scope.resolve(Foo);
      const foo3 = scope.resolve(Foo);

      expect(foo2).toBeInstanceOf(Foo);
      expect(foo3).toBeInstanceOf(Foo);
      expect(foo1 === foo2).toBeFalsy();
      expect(foo2 === foo3).toBeTruthy();
    });

    it("should not create a new instance of requested singleton service", () => {
      class Bar {}

      globalContainer.registerSingleton(Bar, Bar);

      const bar1 = globalContainer.resolve(Bar);

      expect(bar1).toBeInstanceOf(Bar);

      const scope = globalContainer.createChildContainer();
      const bar2 = scope.resolve(Bar);

      expect(bar2).toBeInstanceOf(Bar);
      expect(bar1 === bar2).toBeTruthy();
    });

    it("allows multiple scope levels", () => {
      class Bar {}

      globalContainer.register(Bar, Bar, {
        lifecycle: Lifecycle.ContainerScoped
      });
      const bar = globalContainer.resolve(Bar);

      const scope1 = globalContainer.createChildContainer();
      const bar1 = scope1.resolve(Bar);

      const scope2 = scope1.createChildContainer();
      const bar2 = scope2.resolve(Bar);

      expect(bar === bar1).toBeFalsy();
      expect(bar === bar2).toBeFalsy();
      expect(bar1 === bar2).toBeFalsy();

      expect(bar === globalContainer.resolve(Bar)).toBeTruthy();
      expect(bar1 === scope1.resolve(Bar)).toBeTruthy();
      expect(bar2 === scope2.resolve(Bar)).toBeTruthy();
    });

    it("@scoped decorator registers class as scoped", () => {
      @scoped(Lifecycle.ContainerScoped)
      class Foo {}

      const foo1 = globalContainer.resolve(Foo);

      expect(foo1).toBeInstanceOf(Foo);

      const scope = globalContainer.createChildContainer();
      const foo2 = scope.resolve(Foo);
      const foo3 = scope.resolve(Foo);

      expect(foo2).toBeInstanceOf(Foo);
      expect(foo3).toBeInstanceOf(Foo);
      expect(foo1 === foo2).toBeFalsy();
      expect(foo2 === foo3).toBeTruthy();
    });

    it("@scoped decorator registers class as scoped using custom token", () => {
      @scoped(Lifecycle.ContainerScoped, "Foo")
      class Foo {}

      const foo1 = globalContainer.resolve("Foo");

      expect(foo1).toBeInstanceOf(Foo);

      const scope = globalContainer.createChildContainer();
      const foo2 = scope.resolve("Foo");
      const foo3 = scope.resolve("Foo");

      expect(foo2).toBeInstanceOf(Foo);
      expect(foo3).toBeInstanceOf(Foo);
      expect(foo1 === foo2).toBeFalsy();
      expect(foo2 === foo3).toBeTruthy();
    });

    it("resolve all resolves scoped dependencies properly", () => {
      interface Foo {
        test: string;
      }

      class FooBar implements Foo {
        test = "bar";
      }

      class FooQux implements Foo {
        test = "qux";
      }

      globalContainer.registerSingleton<Foo>("Foo", FooBar);
      globalContainer.register<Foo>("Foo", FooQux, {
        lifecycle: Lifecycle.ContainerScoped
      });
      const foo1 = globalContainer.resolveAll<Foo>("Foo");
      const foo2 = globalContainer.resolveAll<Foo>("Foo");

      expect(foo1[0] === foo2[0]).toBeTruthy();
      expect(foo1[1] === foo2[1]).toBeTruthy();

      const scope = globalContainer.createChildContainer();
      const foo3 = scope.resolveAll<Foo>("Foo");
      const foo4 = scope.resolveAll<Foo>("Foo");

      expect(foo3[0] === foo4[0]).toBeTruthy();
      expect(foo3[1] === foo4[1]).toBeTruthy();

      expect(foo3[0] === foo1[0]).toBeTruthy();
      expect(foo4[0] === foo2[0]).toBeTruthy();

      expect(foo3[1] === foo1[1]).toBeFalsy();
      expect(foo4[1] === foo2[1]).toBeFalsy();
    });
  });
});
