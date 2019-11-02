import Registry from "../registry";
import {Registration} from "../dependency-container";
import Lifecycle from "../types/lifecycle";

let registry: Registry;
beforeEach(() => {
  registry = new Registry();
});

test("getAll returns all registrations of a given key", () => {
  const registration1: Registration = {
    options: {lifecycle: Lifecycle.Singleton},
    provider: {useValue: "provider"}
  };
  const registration2: Registration = {
    options: {lifecycle: Lifecycle.Singleton},
    provider: {useValue: "provider"}
  };

  registry.set("Foo", registration1);
  registry.set("Foo", registration2);

  expect(registry.has("Foo")).toBeTruthy();

  const all = registry.getAll("Foo");
  expect(Array.isArray(all)).toBeTruthy();
  expect(all.length).toBe(2);
  expect(all[0]).toStrictEqual(registration1);
  expect(all[1]).toStrictEqual(registration2);
});

test("get returns the last registration", () => {
  const registration1: Registration = {
    options: {lifecycle: Lifecycle.Singleton},
    provider: {useValue: "provider"}
  };
  const registration2: Registration = {
    options: {lifecycle: Lifecycle.Singleton},
    provider: {useValue: "provider"}
  };

  registry.set("Bar", registration1);
  registry.set("Bar", registration2);

  expect(registry.has("Bar")).toBeTruthy();
  expect(registry.get("Bar")).toStrictEqual(registration2);
});

test("get returns null when there is no registration", () => {
  expect(registry.has("FooBar")).toBeFalsy();
  expect(registry.get("FooBar")).toBeNull();
});

test("clear removes all registrations", () => {
  const registration: Registration = {
    options: {lifecycle: Lifecycle.Singleton},
    provider: {useValue: "provider"}
  };

  registry.set("Foo", registration);
  expect(registry.has("Foo")).toBeTruthy();

  registry.clear();
  expect(registry.has("Foo")).toBeFalsy();
});

test("setAll replaces everything with new value", () => {
  const registration: Registration = {
    options: {lifecycle: Lifecycle.Transient},
    provider: {useValue: "provider"}
  };

  expect(registry.has("Foo")).toBeFalsy();

  registry.set("Foo", registration);
  const fooArray = registry.getAll("Foo");
  registry.setAll("Foo", [registration]);

  expect(fooArray === registry.getAll("Foo")).toBeFalsy();
});
