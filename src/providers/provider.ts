/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import ClassProvider, {isClassProvider} from "./class-provider";
import ValueProvider, {isValueProvider} from "./value-provider";
import TokenProvider, {isTokenProvider} from "./token-provider";
import FactoryProvider, {isFactoryProvider} from "./factory-provider";

type Provider<T = any> =
  | ClassProvider<T>
  | ValueProvider<T>
  | TokenProvider<T>
  | FactoryProvider<T>;

export function isProvider(provider: any): provider is Provider {
  return (
    isClassProvider(provider) ||
    isValueProvider(provider) ||
    isTokenProvider(provider) ||
    isFactoryProvider(provider)
  );
}

export default Provider;
