import * as Types from "./types";
import {instanceCachingFactory} from "./factories";
import {
    ClassProvider,
    FactoryProvider,
    InjectionToken,
    Provider,
    TokenProvider,
    ValueProvider,
    isClassProvider,
    isFactoryProvider,
    isTokenProvider,
    isValueProvider,
    isConstructor
} from "./providers";
import { RegistrationOptions, constructor } from "./types";

/** Dependency Container */
export class DependencyContainer implements Types.DependencyContainer {
    private _registry = new Map<InjectionToken<any>, Provider<any>>();

    public constructor(private parent?: DependencyContainer) {}

    /**
     * Register a dependency provider.
     *
     * @param provider {Provider} The dependency provider
     */
    public register<T>(provider: ValueProvider<T>): DependencyContainer;
    public register<T>(provider: FactoryProvider<T>): DependencyContainer;
    public register<T>(provider: TokenProvider<T>, options?: RegistrationOptions): DependencyContainer;
    public register<T>(provider: ClassProvider<T>, options?: RegistrationOptions): DependencyContainer;
    public register<T>(provider: constructor<T>, options?: RegistrationOptions): DependencyContainer;
    public register<T>(provider: Provider<T>, options: RegistrationOptions = {singleton: false}): DependencyContainer {
        if (options.singleton) {
            if (isTokenProvider(provider)) {
                this._registry.set(provider.token, {
                  token: provider.token,
                  useFactory: instanceCachingFactory(() => this.resolve(provider.useToken))
                });
            } else if (isClassProvider(provider)) {
              this._registry.set(provider.token, {
                token: provider.token,
                useFactory: instanceCachingFactory(() => this.resolve(provider.useClass))
              });
            } else if (isConstructor(provider)) {
              this._registry.set(provider, {
                token: provider,
                useFactory: instanceCachingFactory(() => this.construct(provider))
              });
            } else {
              throw "Cannot use {singleton: true} with ValueProviders or FactoryProviders"
            }
        } else {
            this._registry.set(isConstructor(provider) ? provider : provider.token, provider);
        }

        return this;
    }

    public registerType<T>(token: InjectionToken<T>, type: constructor<T>): DependencyContainer {
      return this.register({
        token,
        useClass: type
      })
    }

    public registerInstance<T>(token: InjectionToken<T>, instance: T): DependencyContainer {
      return this.register({
        token,
        useValue: instance
      });
    }

    /**
     * Resolve a token into an instance
     *
     * @param token {InjectionToken} The dependency token
     * @return {T} An instance of the dependency
     */
    public resolve<T>(token: InjectionToken<T>): T {
        const registration = this.getRegistration(token);

        if (!registration) {
            if (typeof(token) === "string") {
              throw `Attempted to resolve unregistered dependency token: ${token}`;
            }
        }

        if (registration) {
            if (isValueProvider(registration)) {
                return registration.useValue;
            } else if (isTokenProvider(registration)) {
                return this.resolve(registration.useToken);
            } else if (isClassProvider(registration)) {
                return this.construct(registration.useClass);
            } else if (isFactoryProvider(registration)) {
                return registration.useFactory(this);
            } else {
                return this.construct(registration);
            }
        }

        // No registration for this token, but since it's a constructor, return an instance
        return this.construct(<constructor<T>>token);
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

    public createChildContainer(): Types.DependencyContainer {
      return new DependencyContainer(this);
    }

    protected getRegistration<T>(token: InjectionToken<T>): Provider<any> | null {
      if (this.isRegistered(token)) {
        return this._registry.get(token)!;
      }

      if (this.parent) {
        return this.parent.getRegistration(token);
      }

      return null;
    }

    private construct<T>(ctor: constructor<T>): T {
        if(ctor.length === 0) {
          return new ctor();
        }

        const paramInfo = typeInfo.get(ctor);

        if (!paramInfo) {
          throw `TypeInfo not known for ${ctor}`
        }

        const params = paramInfo.map(param => this.resolve(param));

        return new ctor(...params);
    }
}

export const typeInfo = new Map<constructor<any>, any[]>();

export const instance: Types.DependencyContainer = new DependencyContainer();
