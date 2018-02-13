import { Provider, InjectionToken } from "./Providers";

/** Constructor type */
export type constructor<T> = { new(...args: any[]): T };

export type Dictionary<T> = {[key: string]: T};

export interface DependencyContainer {
    register<T>(provider: Provider<T>): void;
    resolve<T>(token: InjectionToken<T>): T;
    isRegistered<T>(token: InjectionToken<T>): boolean;
    reset(): void;
}
