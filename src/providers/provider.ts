import ClassProvider, {isClassProvider} from "./class-provider.ts";
import ValueProvider, {isValueProvider} from "./value-provider.ts";
import TokenProvider, {isTokenProvider} from "./token-provider.ts";
import FactoryProvider, {isFactoryProvider} from "./factory-provider.ts";

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
