import injectable from "../decorators/injectable";
import {instance as globalContainer} from "../dependency-container";
import Lifecycle from "../types/lifecycle";

describe("Scoped registrations", () => {
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
      constructor(public b: B, public c: C) {}
    }

    globalContainer.register(X, {useClass: X}, {lifecycle: Lifecycle.Scoped});
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

    globalContainer.register(X, {useClass: X}, {lifecycle: Lifecycle.Scoped});
    const a = globalContainer.resolve(A);
    const b = globalContainer.resolve(A);

    expect(a.b.x).not.toBe(b.b.x);
  });
});
