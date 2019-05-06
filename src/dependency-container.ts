import DependencyContainer from "./types/dependency-container";
import {
  isClassProvider,
  isFactoryProvider,
  isNormalToken,
  isTokenProvider,
  isValueProvider
} from "./providers";
import Provider from "./providers/provider";
import FactoryProvider from "./providers/factory-provider";
import InjectionToken from "./providers/injection-token";
import TokenProvider from "./providers/token-provider";
import ValueProvider from "./providers/value-provider";
import ClassProvider from "./providers/class-provider";
import RegistrationOptions from "./types/registration-options";
import Lifestyle from "./types/lifestyle";
import constructor from "./types/constructor";

type Registration<T = any> = {
  provider: Provider<T>;
  options: RegistrationOptions;
  instance?: T;
};

export const typeInfo = new Map<constructor<any>, any[]>();

/** Dependency Container */
class InternalDependencyContainer implements DependencyContainer {
  protected _registry = new Map<InjectionToken<any>, Registration>();

  public constructor(protected parent?: InternalDependencyContainer) {}

  /**
   * Register a dependency provider.
   *
   * @param provider {Provider} The dependency provider
   */
  public register<T>(
    token: InjectionToken<T>,
    provider: ValueProvider<T>
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: FactoryProvider<T>
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: TokenProvider<T>,
    options?: RegistrationOptions
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: ClassProvider<T>,
    options?: RegistrationOptions
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    provider: Provider<T>,
    options: RegistrationOptions = {lifestyle: Lifestyle.TRANSIENT}
  ): InternalDependencyContainer {
    if (options.lifestyle === Lifestyle.SINGLETON) {
      if (isValueProvider(provider) || isFactoryProvider(provider)) {
        throw "Cannot use {scope: Scope.SINGLETON} with ValueProviders or FactoryProviders";
      }
    }

    this._registry.set(token, {provider, options});

    return this;
  }

  public registerType<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): InternalDependencyContainer {
    if (isNormalToken(to)) {
      return this.register(from, {
        useToken: to
      });
    }

    return this.register(from, {
      useClass: to
    });
  }

  public registerInstance<T>(
    token: InjectionToken<T>,
    instance: T
  ): InternalDependencyContainer {
    return this.register(token, {
      useValue: instance
    });
  }

  public registerSingleton<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): InternalDependencyContainer;
  public registerSingleton<T>(
    token: constructor<T>,
    to?: constructor<any>
  ): InternalDependencyContainer;
  public registerSingleton<T>(
    from: InjectionToken<T>,
    to?: InjectionToken<T>
  ): InternalDependencyContainer {
    if (isNormalToken(from)) {
      if (isNormalToken(to)) {
        return this.register(
          from,
          {
            useToken: to
          },
          {lifestyle: Lifestyle.SINGLETON}
        );
      } else if (to) {
        return this.register(
          from,
          {
            useClass: to
          },
          {lifestyle: Lifestyle.SINGLETON}
        );
      }

      throw "Cannot register a type name as a singleton without a \"to\" token";
    }

    let useClass = from;
    if (to && !isNormalToken(to)) {
      useClass = to;
    }

    return this.register(
      from,
      {
        useClass
      },
      {lifestyle: Lifestyle.SINGLETON}
    );
  }

  public registerScoped<T>(token: constructor<T>): InternalDependencyContainer {
    return this.register(
      token,
      {
        useClass: token
      },
      {lifestyle: Lifestyle.SCOPED}
    );
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
      // backwards compatible
      if (registration.options.singleton) {
        registration.options.lifestyle = Lifestyle.SINGLETON;
      }

      if (isValueProvider(registration.provider)) {
        return registration.provider.useValue;
      } else if (isTokenProvider(registration.provider)) {
        return registration.options.lifestyle !== Lifestyle.TRANSIENT
          ? registration.instance ||
              (registration.instance = this.resolve(
                registration.provider.useToken
              ))
          : this.resolve(registration.provider.useToken);
      } else if (isClassProvider(registration.provider)) {
        return registration.options.lifestyle !== Lifestyle.TRANSIENT
          ? registration.instance ||
              (registration.instance = this.construct(
                registration.provider.useClass
              ))
          : this.construct(registration.provider.useClass);
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
   * Clears all registered tokens'
   */
  public reset(): void {
    this._registry.clear();
  }

  public createChildContainer(): DependencyContainer {
    return new InternalDependencyContainer(this);
  }

  public enterScope(scope: (container: DependencyContainer) => any): void {
    const ScopedContainer = class extends InternalDependencyContainer {
      public resolve<T>(token: InjectionToken<T>): T {
        const registration = this.getRegistration(token);

        if (!registration) {
          if (isNormalToken(token)) {
            throw `Attempted to resolve unregistered dependency token: ${token.toString()}`;
          }
        }

        if (
          registration &&
          registration.options.lifestyle === Lifestyle.SCOPED
        ) {
          if (isValueProvider(registration.provider)) {
            return registration.provider.useValue;
          } else if (isTokenProvider(registration.provider)) {
            return (
              registration.instance ||
              (registration.instance = this.resolve(
                registration.provider.useToken
              ))
            );
          } else if (isClassProvider(registration.provider)) {
            return (
              registration.instance ||
              (registration.instance = this.construct(
                registration.provider.useClass
              ))
            );
          } else if (isFactoryProvider(registration.provider)) {
            return (
              registration.instance ||
              (registration.instance = registration.provider.useFactory(this))
            );
          } else {
            return (
              registration.instance ||
              (registration.instance = this.construct(registration.provider))
            );
          }
        }
        return super.resolve(token);
      }

      protected getRegistration<T>(
        token: InjectionToken<T>
      ): Registration | null {
        if (this.isRegistered(token)) {
          return this._registry.get(token)!;
        }

        const registered = super.getRegistration(token);
        if (registered && registered.options.lifestyle === Lifestyle.SCOPED) {
          const resetInstance = {...registered, instance: undefined};
          this._registry.set(token, resetInstance);
          return resetInstance;
        }

        return registered;
      }
    };
    scope(new ScopedContainer(this));
  }

  protected getRegistration<T>(token: InjectionToken<T>): Registration | null {
    if (this.isRegistered(token)) {
      return this._registry.get(token)!;
    }

    if (this.parent) {
      return this.parent.getRegistration(token);
    }

    return null;
  }

  protected construct<T>(ctor: constructor<T>): T {
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

export const instance: DependencyContainer = new InternalDependencyContainer();

export default instance;
