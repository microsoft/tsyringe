import {
  ClassProvider,
  FactoryProvider,
  InjectionToken,
  TokenProvider,
  ValueProvider
} from "./providers";

/** Constructor type */
export type constructor<T> = { new (...args: any[]): T };

export type Dictionary<T> = { [key: string]: T };

export type RegistrationOptions = {
  singleton: boolean;
};

export interface DependencyContainer {
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
  resolve<T>(token: InjectionToken<T>): T;
  isRegistered<T>(token: InjectionToken<T>): boolean;
  reset(): void;
  createChildContainer(): DependencyContainer;
}
