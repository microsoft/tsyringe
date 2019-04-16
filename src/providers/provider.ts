import ClassProvider from "./class-provider";
import ValueProvider from "./value-provider";
import TokenProvider from "./token-provider";
import FactoryProvider from "./factory-provider";

type Provider<T> =
  | ClassProvider<T>
  | ValueProvider<T>
  | TokenProvider<T>
  | FactoryProvider<T>;

export default Provider;
