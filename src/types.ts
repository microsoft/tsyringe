import { ClassProvider, FactoryProvider, TokenProvider, ValueProvider, InjectionToken } from "./providers";

/** Constructor type */
export type constructor<T> = { new(...args: any[]): T };

export type Dictionary<T> = {[key: string]: T};

export type RegistrationOptions = {
  singleton: boolean;
}

export interface DependencyContainer {
    register<T>(provider: ValueProvider<T>): DependencyContainer;
    register<T>(provider: FactoryProvider<T>): DependencyContainer;
    register<T>(provider: TokenProvider<T>, options?: RegistrationOptions): DependencyContainer;
    register<T>(provider: ClassProvider<T>, options?: RegistrationOptions): DependencyContainer;
    register<T>(provider: constructor<T>, options?: RegistrationOptions): DependencyContainer;

    registerType<T>(token: InjectionToken<T>, type: constructor<T>): DependencyContainer;
    registerInstance<T>(token: InjectionToken<T>, instance: T): DependencyContainer;
    resolve<T>(token: InjectionToken<T>): T;
    isRegistered<T>(token: InjectionToken<T>): boolean;
    reset(): void;
    createChildContainer(): DependencyContainer;
}
