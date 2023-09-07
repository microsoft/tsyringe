import constructor from "../types/constructor.ts";
import Provider from "./provider.ts";
import {DelayedConstructor} from "../lazy-helpers.ts";

export default interface ClassProvider<T> {
  useClass: constructor<T> | DelayedConstructor<T>;
}

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<any> {
  return !!(provider as ClassProvider<T>).useClass;
}
