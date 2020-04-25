import constructor from "../types/constructor";
import Provider from "./provider";
import {DelayedConstructor} from "../lazy-helpers";

export default interface ClassProvider<T> {
  useClass: constructor<T> | DelayedConstructor<T>;
}

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<any> {
  return !!(provider as ClassProvider<T>).useClass;
}
