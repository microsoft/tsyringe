import { Provider, InjectionToken } from "./providers";

/** Constructor type */
export type constructor<T> = { new(...args: any[]): T };

export type Dictionary<T> = {[key: string]: T};

export interface DependencyContainer {
    register<T>(provider: Provider<T>): DependencyContainer;
    registerType<T>(token: InjectionToken<T>, type: constructor<T>): DependencyContainer;
    registerInstance<T>(token: InjectionToken<T>, instance: T): DependencyContainer;
    resolve<T>(token: InjectionToken<T>): T;
    isRegistered<T>(token: InjectionToken<T>): boolean;
    reset(): void;
    createChildContainer(): DependencyContainer;
}
