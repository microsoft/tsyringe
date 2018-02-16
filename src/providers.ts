import { DependencyContainer } from "./types";
import { constructor } from "./types";

export type InjectionToken<T> = constructor<T> | string;

export interface BaseProvider {
    token: InjectionToken<any>;
}

export interface ClassProvider<T> extends BaseProvider {
    useClass: constructor<T>;
}

export interface ValueProvider<T> extends BaseProvider {
    useValue: T;
}

export interface TokenProvider<T> extends BaseProvider {
    useToken: InjectionToken<T>;
}

/**
 * Provide a dependency using a factory.
 * Unlike the other providers, this does not support instance caching. If
 * you need instance caching, your factory method must implement it.
 */
export interface FactoryProvider<T> extends BaseProvider {
    useFactory: (dependencyContainer: DependencyContainer) => T;
}

export type Provider<T> = constructor<T> | ClassProvider<T> | ValueProvider<T> | TokenProvider<T> | FactoryProvider<T>;

export function isClassProvider<T>(provider: Provider<T>): provider is ClassProvider<any> {
    return !!(<ClassProvider<T>>provider).useClass;
}

export function isValueProvider<T>(provider: Provider<T>): provider is ValueProvider<T> {
    return (<ValueProvider<T>>provider).useValue != undefined;
}

export function isTokenProvider<T>(provider: Provider<T>): provider is TokenProvider<any> {
    return !!(<TokenProvider<T>>provider).useToken;
}

export function isFactoryProvider<T>(provider: Provider<T>): provider is FactoryProvider<any> {
    return !!(<FactoryProvider<T>>provider).useFactory;
}

export function isConstructor<T>(provider: Provider<T>): provider is constructor<T> {
  return !isClassProvider(provider) && !isValueProvider(provider) && !isTokenProvider(provider) && !isFactoryProvider(provider);
}
