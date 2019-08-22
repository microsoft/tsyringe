import DependencyContainer from "../types/dependency-container";
import Provider from "./provider";
import {constructor} from "../types";

/**
 * Provide a dependency using a factory.
 * Unlike the other providers, this does not support instance caching. If
 * you need instance caching, your factory method must implement it.
 */
export default interface FactoryProvider<T> {
  useFactory: (
    dependencyContainer: DependencyContainer,
    target?: constructor<T>
  ) => T;
}

export function isFactoryProvider<T>(
  provider: Provider<T>
): provider is FactoryProvider<any> {
  return !!(<FactoryProvider<T>>provider).useFactory;
}
