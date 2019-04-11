import { DependencyContainer } from "./types";
import { constructor } from "./types";

export type InjectionToken<T = any> = constructor<T> | string | symbol;

export interface ClassProvider<T> {
  useClass: constructor<T>;
}

export interface ValueProvider<T> {
  useValue: T;
}

export interface TokenProvider<T> {
  useToken: InjectionToken<T>;
}

/**
 * Provide a dependency using a factory.
 * Unlike the other providers, this does not support instance caching. If
 * you need instance caching, your factory method must implement it.
 */
export interface FactoryProvider<T> {
  useFactory: (dependencyContainer: DependencyContainer) => T;
}

export type Provider<T> =
  | ClassProvider<T>
  | ValueProvider<T>
  | TokenProvider<T>
  | FactoryProvider<T>;

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<any> {
  return !!(<ClassProvider<T>>provider).useClass;
}

export function isValueProvider<T>(
  provider: Provider<T>
): provider is ValueProvider<T> {
  return (<ValueProvider<T>>provider).useValue != undefined;
}

export function isTokenProvider<T>(
  provider: Provider<T>
): provider is TokenProvider<any> {
  return !!(<TokenProvider<T>>provider).useToken;
}

export function isFactoryProvider<T>(
  provider: Provider<T>
): provider is FactoryProvider<any> {
  return !!(<FactoryProvider<T>>provider).useFactory;
}

export function isNormalToken(
  token?: InjectionToken<any>
): token is string | symbol {
  return typeof token === "string" || typeof token === "symbol";
}
