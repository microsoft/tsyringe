import Provider from "./provider";

export default interface ValueProvider<T> {
  useValue: T;
}

export function isValueProvider<T>(
  provider: Provider<T>
): provider is ValueProvider<T> {
  return (provider as ValueProvider<T>).useValue != undefined;
}
