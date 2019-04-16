import constructor from "../types/constructor";
import Provider from "./provider";

export default interface ClassProvider<T> {
  useClass: constructor<T>;
}

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<any> {
  return !!(<ClassProvider<T>>provider).useClass;
}
