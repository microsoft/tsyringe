import {instance as globalContainer} from "../dependency-container";
import {A03} from "./fixtures/03-test-case-A03-lazy-injects-B03-interface";
import {B03} from "./fixtures/03-test-case-B03-lazy-injects-A03-interface";

test("Lazy creation with proxies allow circular dependencies using interfaces", () => {
  const a = globalContainer.resolve(A03);
  expect(a).toBeInstanceOf(A03);
  expect(a.b).toBeInstanceOf(B03);
  expect(a.b.name).toBe("B03");
});
