import * as Types from "./types";
import {
  ClassProvider,
  FactoryProvider,
  InjectionToken,
  Provider,
  TokenProvider,
  ValueProvider,
  isClassProvider,
  isFactoryProvider,
  isNormalToken,
  isTokenProvider,
  isValueProvider
} from "./providers";
import {RegistrationOptions, constructor} from "./types";

type Registration<T = any> = {
  provider: Provider<T>;
  options: RegistrationOptions;
  instance?: T;
};

/** Dependency Container */
export class DependencyContainer implements Types.DependencyContainer {
  private _registry = new Map<InjectionToken<any>, Registration>();

  public constructor(private parent?: DependencyContainer) { }

  /**
   * Register a dependency provider.
   *
   * @param provider {Provider} The dependency provider
   */
  public register<T>(token: InjectionToken<T>, provider: ValueProvider<T>): DependencyContainer;
  public register<T>(token: InjectionToken<T>, provider: FactoryProvider<T>): DependencyContainer;
  public register<T>(token: InjectionToken<T>, provider: TokenProvider<T>, options?: RegistrationOptions): DependencyContainer;
  public register<T>(token: InjectionToken<T>, provider: ClassProvider<T>, options?: RegistrationOptions): DependencyContainer;
  public register<T>(token: InjectionToken<T>, provider: Provider<T>, options: RegistrationOptions = {singleton: false}): DependencyContainer {
    if (options.singleton) {
      if (isValueProvider(provider) || isFactoryProvider(provider)) {
        throw "Cannot use {singleton: true} with ValueProviders or FactoryProviders";
      }
    }

    this._registry.set(token, {provider, options});

    return this;
  }

  public registerType<T>(from: InjectionToken<T>, to: InjectionToken<T>): DependencyContainer {
    if (isNormalToken(to)) {
      return this.register(from, {
        useToken: to
      });
    }

    return this.register(from, {
      useClass: to
    });
  }

  public registerInstance<T>(token: InjectionToken<T>, instance: T): DependencyContainer {
    return this.register(token, {
      useValue: instance
    });
  }

  public registerSingleton<T>(from: InjectionToken<T>, to: InjectionToken<T>): DependencyContainer;
  public registerSingleton<T>(token: constructor<T>, to?: constructor<any>): DependencyContainer;
  public registerSingleton<T>(from: InjectionToken<T>, to?: InjectionToken<T>): DependencyContainer {
    if (isNormalToken(from)) {
      if (isNormalToken(to)) {
        return this.register(from, {
          useToken: to
        }, {singleton: true});
      } else if (to) {
        return this.register(from, {
          useClass: to
        }, {singleton: true});
      }

      throw "Cannot register a type name as a singleton without a \"to\" token";
    }

    let useClass = from;
    if (to && !isNormalToken(to)) {
      useClass = to;
    }

    return this.register(from, {
      useClass
    }, {singleton: true});
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
      if (isNormalToken(token)) {
        throw `Attempted to resolve unregistered dependency token: ${token.toString()}`;
      }
    }

    if (registration) {
      if (isValueProvider(registration.provider)) {
        return registration.provider.useValue;
      } else if (isTokenProvider(registration.provider)) {
        return registration.options.singleton ?
          (registration.instance || (registration.instance = this.resolve(registration.provider.useToken))) :
          this.resolve(registration.provider.useToken);
      } else if (isClassProvider(registration.provider)) {
        return registration.options.singleton ?
          (registration.instance || (registration.instance = this.construct(registration.provider.useClass))) :
          this.construct(registration.provider.useClass);
      } else if (isFactoryProvider(registration.provider)) {
        return registration.provider.useFactory(this);
      } else {
        return this.construct(registration.provider);
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

  private getRegistration<T>(token: InjectionToken<T>): Registration | null {
    if (this.isRegistered(token)) {
      return this._registry.get(token)!;
    }

    if (this.parent) {
      return this.parent.getRegistration(token);
    }

    return null;
  }

  private construct<T>(ctor: constructor<T>): T {
    if (ctor.length === 0) {
      return new ctor();
    }

    const paramInfo = typeInfo.get(ctor);

    if (!paramInfo || paramInfo.length === 0) {
      throw `TypeInfo not known for ${ctor}`;
    }

    const params = paramInfo.map(param => this.resolve(param));

    return new ctor(...params);
  }
}

export const typeInfo = new Map<constructor<any>, any[]>();

export const instance: Types.DependencyContainer = new DependencyContainer();
