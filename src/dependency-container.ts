import * as Types from "./types";
import {
    InjectionToken,
    Provider,
    isClassProvider,
    isFactoryProvider,
    isTokenProvider,
    isValueProvider
} from "./providers";
import { constructor } from "./types";

/** Dependency Container */
class DependencyContainer implements Types.DependencyContainer {
    private _registry = new Map<InjectionToken<any>, [Provider<any>, any]>();

    /**
     * Register a dependency provider.
     *
     * @param provider {Provider} The dependency provider
     */
    public register<T>(provider: Provider<T>): void {
        // If constructor
        if (!isClassProvider(provider) && !isTokenProvider(provider) && !isValueProvider(provider) && !isFactoryProvider(provider)) {
            if (!this.isRegistered(provider)) {
                this._registry.set(provider, [provider, undefined]);
            }
        } else {
            if (!this.isRegistered(provider.token)) {
                this._registry.set(provider.token, [provider, undefined]);
            }
        }
    }

    /**
     * Resolve a token into an instance
     *
     * @param token {InjectionToken} The dependency token
     * @return {T} An instance of the dependency
     */
    public resolve<T>(token: InjectionToken<T>): T {
        const registration = this.isRegistered(token) && this._registry.get(token);

        if (!registration && typeof(token) === "string") {
            throw `Attempted to resolve unregistered dependency token: ${token}`;
        }

        if (registration) {
            const provider: Provider<T> = registration[0];
            const cachedInstance: T = registration[1];

            if (cachedInstance != undefined) {
                return cachedInstance;
            }

            if (isValueProvider(provider)) {
                return registration[1] = provider.useValue;
            } else if (isTokenProvider(provider)) {
                return registration[1] = this.resolve(provider.useToken);
            } else if (isClassProvider(provider)) {
                return registration[1] = this._construct(provider.useClass);
            } else if (isFactoryProvider(provider)) {
                return provider.useFactory(this);
            } else {
                return registration[1] = this._construct(provider);
            }
        }

        // No registration for this token, but since it's a constructor, return an instance
        return this._construct(<constructor<T>>token);
    }

    /**
     * Check if the given dependency is registered
     *
     * @return {boolean}
     */
    public isRegistered<T>(token: InjectionToken<T>): boolean {
        return this._registry.has(token);
    }

    /**
     * Clears all registered tokens
     */
    public reset(): void {
      this._registry.clear();
    }

    private _construct<T>(ctor: constructor<T>): T {
        return new ctor();
    }
}

const instance: Types.DependencyContainer = new DependencyContainer();

export default instance;
