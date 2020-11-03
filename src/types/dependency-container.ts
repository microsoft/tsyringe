import FactoryProvider from "../providers/factory-provider";
import InjectionToken from "../providers/injection-token";
import TokenProvider from "../providers/token-provider";
import ValueProvider from "../providers/value-provider";
import ClassProvider from "../providers/class-provider";
import constructor from "./constructor";
import RegistrationOptions from "./registration-options";
import InterceptorOptions from "./interceptor-options";
import {ResolutionType} from "../dependency-container";

export default interface DependencyContainer {
  register<T>(
    token: InjectionToken<T>,
    provider: ValueProvider<T>
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: FactoryProvider<T>
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: TokenProvider<T>,
    options?: RegistrationOptions
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: ClassProvider<T>,
    options?: RegistrationOptions
  ): DependencyContainer;
  register<T>(
    token: InjectionToken<T>,
    provider: constructor<T>,
    options?: RegistrationOptions
  ): DependencyContainer;

  registerSingleton<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): DependencyContainer;
  registerSingleton<T>(token: constructor<T>): DependencyContainer;

  registerType<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): DependencyContainer;

  registerInstance<T>(
    token: InjectionToken<T>,
    instance: T
  ): DependencyContainer;

  /**
   * Resolve a token into an instance
   *
   * @param token The dependency token
   * @return An instance of the dependency
   */
  resolve<T>(token: InjectionToken<T>): T;
  resolveAll<T>(token: InjectionToken<T>): T[];

  /**
   * Check if the given dependency is registered
   *
   * @param token The token to check
   * @param recursive Should parent containers be checked?
   * @return Whether or not the token is registered
   */
  isRegistered<T>(token: InjectionToken<T>, recursive?: boolean): boolean;

  /**
   * Clears all registered tokens
   */
  reset(): void;

  clearInstances(): void;
  createChildContainer(): DependencyContainer;

  /**
   * Registers a callback that is called when a specific injection token is resolved
   * @param token The token to intercept
   * @param callback The callback that is called before the token is resolved
   * @param options Options for under what circumstances the callback will be called
   */
  beforeResolution<T>(
    token: InjectionToken<T>,
    callback: (t: InjectionToken<T>, r: ResolutionType) => void,
    options?: InterceptorOptions
  ): void;

  /**
   * Registers a callback that is called after a successful resolution of the token
   * @param token The token to intercept
   * @param callback The callback that is called after the token is resolved
   * @param options Options for under what circumstances the callback will be called
   */
  afterResolution<T>(
    token: InjectionToken<T>,
    callback: (token: InjectionToken<T>, t: T, r: ResolutionType) => void,
    options?: InterceptorOptions
  ): void;
}
