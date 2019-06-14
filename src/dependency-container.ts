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
import InjectionToken, {isTokenDescriptor} from "./providers/injection-token";
import TokenProvider from "./providers/token-provider";
import ValueProvider from "./providers/value-provider";
import ClassProvider from "./providers/class-provider";
import RegistrationOptions, {Lifetime} from "./types/registration-options";
import constructor from "./types/constructor";
import Registry from "./registry";

export type Registration<T = any> = {
  provider: Provider<T>;
  options: RegistrationOptions;
  instance?: T;
};

export const typeInfo = new Map<constructor<any>, any[]>();

/** Dependency Container */
class InternalDependencyContainer implements DependencyContainer {
  protected _registry = new Registry();
  /**
   * Wether this container is within a scope
   */
  public readonly scoped: boolean = false;

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
    options: RegistrationOptions = {lifetime: Lifetime.TRANSIENT}
  ): InternalDependencyContainer {
    const lifetime = options.lifetime;
    if (lifetime === Lifetime.SINGLETON || lifetime === Lifetime.SCOPED) {
      if (isValueProvider(provider) || isFactoryProvider(provider)) {
        throw `Cannot use lifetime "${lifetime}" with ValueProviders or FactoryProviders`;
      }
    }

    this._registry.set(token, {provider, options});

    return this;
  }

  private registerTokenOrClass<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>,
    options: RegistrationOptions = {lifetime: Lifetime.TRANSIENT}
  ): InternalDependencyContainer {
    if (isNormalToken(to)) {
      return this.register(from, {useToken: to}, options);
    }

    return this.register(from, {useClass: to}, options);
  }

  public registerType<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): InternalDependencyContainer {
    return this.registerTokenOrClass(from, to);
  }

  public registerScoped<T>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): InternalDependencyContainer {
    return this.registerTokenOrClass(from, to, {lifetime: Lifetime.SCOPED});
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
          {useToken: to},
          {lifetime: Lifetime.SINGLETON}
        );
      } else if (to) {
        return this.register(
          from,
          {useClass: to},
          {lifetime: Lifetime.SINGLETON}
        );
      }

      throw "Cannot register a type name as a singleton without a \"to\" token";
    }

    let useClass = from;
    if (to && !isNormalToken(to)) {
      useClass = to;
    }

    return this.register(from, {useClass}, {lifetime: Lifetime.SINGLETON});
  }

  /**
   * Resolve a token into an instance
   *
   * @param token {InjectionToken} The dependency token
   * @return {T} An instance of the dependency
   */
  public resolve<T>(token: InjectionToken<T>): T {
    const registration = this.getRegistration(token);

    if (!registration && isNormalToken(token)) {
      throw `Attempted to resolve unregistered dependency token: ${token.toString()}`;
    }

    if (registration) {
      return this.resolveRegistration(registration);
    }

    // No registration for this token, but since it's a constructor, return an instance
    return this.construct(<constructor<T>>token);
  }

  private resolveRegistration<T>(registration: Registration): T {
    // backwards compatibility
    if (registration.options.singleton) {
      registration.options.lifetime = Lifetime.SINGLETON;
    }

    const inScope =
      registration.options.lifetime === Lifetime.SCOPED && this.scoped;

    const returnInstance =
      registration.options.lifetime === Lifetime.SINGLETON || inScope;

    if (isValueProvider(registration.provider)) {
      return registration.provider.useValue;
    } else if (isTokenProvider(registration.provider)) {
      return returnInstance
        ? registration.instance ||
            (registration.instance = this.resolve(
              registration.provider.useToken
            ))
        : this.resolve(registration.provider.useToken);
    } else if (isClassProvider(registration.provider)) {
      return returnInstance
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

  public resolveAll<T>(token: InjectionToken<T>): T[] {
    const registration = this.getAllRegistrations(token);

    if (!registration && isNormalToken(token)) {
      throw `Attempted to resolve unregistered dependency token: ${token.toString()}`;
    }

    if (registration) {
      return registration.map(item => this.resolveRegistration<T>(item));
    }

    // No registration for this token, but since it's a constructor, return an instance
    return [this.construct(<constructor<T>>token)];
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

  public createScope(): DependencyContainer {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new ScopedInternalDependencyContainer(this);
  }

  private getRegistration<T>(token: InjectionToken<T>): Registration | null {
    if (this.isRegistered(token)) {
      return this._registry.get(token)!;
    }

    const registered = this.parent && this.parent.getRegistration(token);
    if (registered && registered.options.lifetime === Lifetime.SCOPED) {
      const reset = this.resetInstance(registered);
      this._registry.set(token, reset);
      return reset;
    }

    return registered || null;
  }

  private getAllRegistrations<T>(
    token: InjectionToken<T>
  ): Registration[] | null {
    if (this.isRegistered(token)) {
      return this._registry.getAll(token);
    }

    const registered = this.parent && this.parent.getAllRegistrations(token);
    if (registered) {
      const reset = registered.map(item =>
        item.options.lifetime === Lifetime.SCOPED
          ? this.resetInstance(item)
          : item
      );
      this._registry.setAll(token, reset);
      return reset;
    }

    return registered || null;
  }

  private resetInstance(registered: Registration<any>): Registration<any> {
    return {...registered, instance: undefined};
  }

  private construct<T>(ctor: constructor<T>): T {
    if (ctor.length === 0) {
      return new ctor();
    }

    const paramInfo = typeInfo.get(ctor);

    if (!paramInfo || paramInfo.length === 0) {
      throw `TypeInfo not known for ${ctor}`;
    }

    const params = paramInfo.map(param => {
      if (isTokenDescriptor(param)) {
        return param.multiple
          ? this.resolveAll(param.token)
          : this.resolve(param.token);
      }
      return this.resolve(param);
    });

    return new ctor(...params);
  }
}

/** scoped dependency container */
class ScopedInternalDependencyContainer extends InternalDependencyContainer {
  /**
   * @inheritdoc
   */
  public readonly scoped: boolean = true;
}

export const instance: DependencyContainer = new InternalDependencyContainer();

export default instance;
