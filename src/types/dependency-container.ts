import FactoryProvider from "../providers/factory-provider";
import InjectionToken from "../providers/injection-token";
import TokenProvider from "../providers/token-provider";
import ValueProvider from "../providers/value-provider";
import ClassProvider from "../providers/class-provider";
import constructor from "./constructor";
import RegistrationOptions from "./registration-options";

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
  resolveAll<T>(token: InjectionToken<T>): T[];
  isRegistered<T>(token: InjectionToken<T>): boolean;
  reset(): void;
  createChildContainer(): DependencyContainer;
  createScope(): DependencyContainer;
}
