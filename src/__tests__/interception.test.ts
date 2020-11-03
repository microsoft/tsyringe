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
