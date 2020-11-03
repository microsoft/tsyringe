import {instance as globalContainer} from "../dependency-container";
import Frequency from "../types/frequency";

test("beforeResolution interceptor gets called correctly", () => {
  class Bar {}
  let interceptorCalled = false;
  globalContainer.beforeResolution(
    Bar,
    () => {
      interceptorCalled = true;
    },
    {frequency: Frequency.Once}
  );
  globalContainer.resolve(Bar);

  expect(interceptorCalled).toBeTruthy();
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

test("beforeResolution always run interceptor only gets called on each resolution", () => {
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