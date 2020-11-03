import {
  instance as globalContainer,
  ResolutionType
} from "../dependency-container";
import Frequency from "../types/frequency";

// beforeResolution .resolve() tests
test("beforeResolution interceptor gets called correctly", () => {
  class Bar {}
  let interceptorCalled = false;
  globalContainer.beforeResolution(Bar, (_, resolutionType) => {
    interceptorCalled = true;
    expect(resolutionType).toEqual(ResolutionType.Single);
  });
  globalContainer.resolve(Bar);

  expect(interceptorCalled).toBeTruthy();
});
test("beforeResolution interceptor gets called correctly", () => {
  class Bar {}
  let interceptorCalled = false;
  globalContainer.beforeResolution(Bar, () => {
    interceptorCalled = true;
  });
  globalContainer.resolve(Bar);

  expect(interceptorCalled).toBeTruthy();
});

test("beforeResolution interceptor does not get called when resolving other types", () => {
  class Bar {}
  class Foo {}
  let interceptorCalled = false;
  globalContainer.beforeResolution(Bar, () => {
    interceptorCalled = true;
  });
  globalContainer.resolve(Foo);

  expect(interceptorCalled).toBeFalsy();
});

test("beforeResolution one-time interceptor only gets called once", () => {
  class Bar {}
  let timesCalled = 0;
  globalContainer.beforeResolution(
    Bar,
    () => {
      timesCalled++;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(timesCalled).toEqual(1);
});

test("beforeResolution always run interceptor gets called on each resolution", () => {
  class Bar {}
  let timesCalled = 0;
  globalContainer.beforeResolution(
    Bar,
    () => {
      timesCalled++;
    },
    {frequency: Frequency.Always}
  );
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(timesCalled).toEqual(2);
});

test("beforeResolution multiple interceptors get called correctly", () => {
  class Bar {}
  let interceptor1Called = false;
  let interceptor2Called = false;
  globalContainer.beforeResolution(
    Bar,
    () => {
      interceptor1Called = true;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.beforeResolution(
    Bar,
    () => {
      interceptor2Called = true;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.resolve(Bar);

  expect(interceptor1Called).toBeTruthy();
  expect(interceptor2Called).toBeTruthy();
});

test("beforeResolution multiple interceptors get per their options", () => {
  class Bar {}
  let interceptor1CalledTimes = 0;
  let interceptor2CalledTimes = 0;
  globalContainer.beforeResolution(
    Bar,
    () => {
      interceptor1CalledTimes++;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.beforeResolution(
    Bar,
    () => {
      interceptor2CalledTimes++;
    },
    {frequency: Frequency.Always}
  );
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptor1CalledTimes).toEqual(1);
  expect(interceptor2CalledTimes).toEqual(2);
});

// beforeResolution .resolveAll() tests
test("beforeResolution interceptor gets called correctly on resolveAll()", () => {
  class Bar {}
  let interceptorCalled = false;
  globalContainer.beforeResolution(Bar, (_, resolutionType) => {
    interceptorCalled = true;
    expect(resolutionType).toEqual(ResolutionType.All);
  });
  globalContainer.resolveAll(Bar);

  expect(interceptorCalled).toBeTruthy();
});

// afterResolution .resolve() tests
test("afterResolution interceptor gets called correctly", () => {
  class Bar {}
  let interceptorCalled = false;

  globalContainer.afterResolution(
    Bar,
    () => {
      interceptorCalled = true;
    },
    {frequency: Frequency.Always}
  );
  globalContainer.resolve(Bar);

  expect(interceptorCalled).toBeTruthy();
});

test("afterResolution interceptor passes object of correct type", () => {
  class Bar {}
  let interceptorCalled = false;

  globalContainer.afterResolution(
    Bar,
    (_, result) => {
      interceptorCalled = true;
      expect(result).toBeInstanceOf(Bar);
    },
    {frequency: Frequency.Always}
  );
  globalContainer.resolve(Bar);

  expect(interceptorCalled).toBeTruthy();
});

test("afterResolution interceptor gets called correctly", () => {
  class Bar {}
  let interceptorCalled = false;
  globalContainer.afterResolution(Bar, () => {
    interceptorCalled = true;
  });
  globalContainer.resolve(Bar);

  expect(interceptorCalled).toBeTruthy();
});

test("afterResolution interceptor does not get called when resolving other types", () => {
  class Bar {}
  class Foo {}
  let interceptorCalled = false;
  globalContainer.afterResolution(Bar, () => {
    interceptorCalled = true;
  });
  globalContainer.resolve(Foo);

  expect(interceptorCalled).toBeFalsy();
});

test("afterResolution one-time interceptor only gets called once", () => {
  class Bar {}
  let timesCalled = 0;
  globalContainer.afterResolution(
    Bar,
    () => {
      timesCalled++;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(timesCalled).toEqual(1);
});

test("afterResolution always run interceptor gets called on each resolution", () => {
  class Bar {}
  let timesCalled = 0;
  globalContainer.afterResolution(
    Bar,
    () => {
      timesCalled++;
    },
    {frequency: Frequency.Always}
  );
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(timesCalled).toEqual(2);
});

test("afterResolution multiple interceptors get called correctly", () => {
  class Bar {}
  let interceptor1Called = false;
  let interceptor2Called = false;
  globalContainer.afterResolution(
    Bar,
    () => {
      interceptor1Called = true;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.afterResolution(
    Bar,
    () => {
      interceptor2Called = true;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.resolve(Bar);

  expect(interceptor1Called).toBeTruthy();
  expect(interceptor2Called).toBeTruthy();
});

test("beforeResolution multiple interceptors get per their options", () => {
  class Bar {}
  let interceptor1CalledTimes = 0;
  let interceptor2CalledTimes = 0;
  globalContainer.afterResolution(
    Bar,
    () => {
      interceptor1CalledTimes++;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.afterResolution(
    Bar,
    () => {
      interceptor2CalledTimes++;
    },
    {frequency: Frequency.Always}
  );
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptor1CalledTimes).toEqual(1);
  expect(interceptor2CalledTimes).toEqual(2);
});

// afterResolution resolveAll() tests
test("afterResolution interceptor gets called correctly on resolveAll()", () => {
  class Bar {}
  let interceptorCalled = false;
  globalContainer.afterResolution(Bar, (_t, _r, resolutionType) => {
    interceptorCalled = true;
    expect(resolutionType).toEqual(ResolutionType.All);
  });
  globalContainer.resolveAll(Bar);

  expect(interceptorCalled).toBeTruthy();
});
