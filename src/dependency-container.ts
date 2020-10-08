import DependencyContainer from "./types/dependency-container";
import {
  isClassProvider,
  isFactoryProvider,
  isNormalToken,
  isTokenProvider,
  isValueProvider
} from "./providers";
import Provider, {isProvider} from "./providers/provider";
import FactoryProvider from "./providers/factory-provider";
import InjectionToken, {
  isConstructorToken,
  isTokenDescriptor,
  TokenDescriptor
} from "./providers/injection-token";
import TokenProvider from "./providers/token-provider";
import ValueProvider from "./providers/value-provider";
import ClassProvider from "./providers/class-provider";
import RegistrationOptions from "./types/registration-options";
import constructor from "./types/constructor";
import Registry from "./registry";
import Lifecycle from "./types/lifecycle";
import ResolutionContext from "./resolution-context";
import {formatErrorCtor} from "./error-helpers";
import {DelayedConstructor} from "./lazy-helpers";

export type Registration<T = any> = {
  provider: Provider<T>;
  options: RegistrationOptions;
  instance?: T;
};

export type ParamInfo = TokenDescriptor | InjectionToken<any>;

export const typeInfo = new Map<constructor<any>, ParamInfo[]>();

/** Dependency Container */
class InternalDependencyContainer implements DependencyContainer {
  private _registry = new Registry();

  public constructor(private parent?: InternalDependencyContainer) {}

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
    provider: constructor<T>,
    options?: RegistrationOptions
  ): InternalDependencyContainer;
  public register<T>(
    token: InjectionToken<T>,
    providerOrConstructor: Provider<T> | constructor<T>,
    options: RegistrationOptions = {lifecycle: Lifecycle.Transient}
  ): InternalDependencyContainer {
    let provider: Provider<T>;

    if (!isProvider(providerOrConstructor)) {
      provider = {useClass: providerOrConstructor};
    } else {
      provider = providerOrConstructor;
    }

    // Search the token graph for cycles
    if (isTokenProvider(provider)) {
      const path = [token];

      let tokenProvider: TokenProvider<T> | null = provider;
      while (tokenProvider != null) {
        const currentToken = tokenProvider.useToken;
        if (path.includes(currentToken)) {
          throw new Error(
            `Token registration cycle detected! ${[...path, currentToken].join(
              " -> "
            )}`
          );
        }

        path.push(currentToken);

        const registration = this._registry.get(currentToken);

        if (registration && isTokenProvider(registration.provider)) {
          tokenProvider = registration.provider;
        } else {
          tokenProvider = null;
        }
      }
    }

    if (
      options.lifecycle === Lifecycle.Singleton ||
      options.lifecycle == Lifecycle.ContainerScoped ||
      options.lifecycle == Lifecycle.ResolutionScoped
    ) {
      if (isValueProvider(provider) || isFactoryProvider(provider)) {
        throw new Error(
          `Cannot use lifecycle "${
            Lifecycle[options.lifecycle]
          }" with ValueProviders or FactoryProviders`
        );
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
          {lifecycle: Lifecycle.Singleton}
        );
      } else if (to) {
        return this.register(
          from,
          {
            useClass: to
          },
          {lifecycle: Lifecycle.Singleton}
        );
      }

      throw new Error(
        'Cannot register a type name as a singleton without a "to" token'
      );
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
      {lifecycle: Lifecycle.Singleton}
    );
  }

  public resolve<T>(
    token: InjectionToken<T>,
    context: ResolutionContext = new ResolutionContext()
  ): T {
    const registration = this.getRegistration(token);

    if (!registration && isNormalToken(token)) {
      throw new Error(
        `Attempted to resolve unregistered dependency token: "${token.toString()}"`
      );
    }

    if (registration) {
      return this.resolveRegistration(registration, context);
    }

    // No registration for this token, but since it's a constructor, return an instance
    if (isConstructorToken(token)) {
      return this.construct(token, context);
    }
    throw new Error(
      "Attempted to construct an undefined constructor. Could mean a circular dependency problem. Try using `delay` function."
    );
  }

  private resolveRegistration<T>(
    registration: Registration,
    context: ResolutionContext
  ): T {
    // If we have already resolved this scoped dependency, return it
    if (
      registration.options.lifecycle === Lifecycle.ResolutionScoped &&
      context.scopedResolutions.has(registration)
    ) {
      return context.scopedResolutions.get(registration);
    }

    const isSingleton = registration.options.lifecycle === Lifecycle.Singleton;
    const isContainerScoped =
      registration.options.lifecycle === Lifecycle.ContainerScoped;

    const returnInstance = isSingleton || isContainerScoped;

    let resolved: T;

    if (isValueProvider(registration.provider)) {
      resolved = registration.provider.useValue;
    } else if (isTokenProvider(registration.provider)) {
      resolved = returnInstance
        ? registration.instance ||
          (registration.instance = this.resolve(
            registration.provider.useToken,
            context
          ))
        : this.resolve(registration.provider.useToken, context);
    } else if (isClassProvider(registration.provider)) {
      resolved = returnInstance
        ? registration.instance ||
          (registration.instance = this.construct(
            registration.provider.useClass,
            context
          ))
        : this.construct(registration.provider.useClass, context);
    } else if (isFactoryProvider(registration.provider)) {
      resolved = registration.provider.useFactory(this);
    } else {
      resolved = this.construct(registration.provider, context);
    }

    // If this is a scoped dependency, store resolved instance in context
    if (registration.options.lifecycle === Lifecycle.ResolutionScoped) {
      context.scopedResolutions.set(registration, resolved);
    }

    return resolved;
  }

  public resolveAll<T>(
    token: InjectionToken<T>,
    context: ResolutionContext = new ResolutionContext()
  ): T[] {
    const registrations = this.getAllRegistrations(token);

    if (!registrations && isNormalToken(token)) {
      throw new Error(
        `Attempted to resolve unregistered dependency token: "${token.toString()}"`
      );
    }

    if (registrations) {
      return registrations.map(item =>
        this.resolveRegistration<T>(item, context)
      );
    }

    // No registration for this token, but since it's a constructor, return an instance
    return [this.construct(token as constructor<T>, context)];
  }

  public isRegistered<T>(token: InjectionToken<T>, recursive = false): boolean {
    return (
      this._registry.has(token) ||
      (recursive &&
        (this.parent || false) &&
        this.parent.isRegistered(token, true))
    );
  }

  public reset(): void {
    this._registry.clear();
  }

  public clearInstances(): void {
    for (const [token, registrations] of this._registry.entries()) {
      this._registry.setAll(
        token,
        registrations
          // Clear ValueProvider registrations
          .filter(registration => !isValueProvider(registration.provider))
          // Clear instances
          .map(registration => {
            registration.instance = undefined;
            return registration;
          })
      );
    }
  }

  public createChildContainer(): DependencyContainer {
    const childContainer = new InternalDependencyContainer(this);

    for (const [token, registrations] of this._registry.entries()) {
      // If there are any ContainerScoped registrations, we need to copy
      // ALL registrations to the child container, if we were to copy just
      // the ContainerScoped registrations, we would lose access to the others
      if (
        registrations.some(
          ({options}) => options.lifecycle === Lifecycle.ContainerScoped
        )
      ) {
        childContainer._registry.setAll(
          token,
          registrations.map<Registration>(registration => {
            if (registration.options.lifecycle === Lifecycle.ContainerScoped) {
              return {
                provider: registration.provider,
                options: registration.options
              };
            }

            return registration;
          })
        );
      }
    }

    return childContainer;
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

  private getAllRegistrations<T>(
    token: InjectionToken<T>
  ): Registration[] | null {
    if (this.isRegistered(token)) {
      return this._registry.getAll(token);
    }

    if (this.parent) {
      return this.parent.getAllRegistrations(token);
    }

    return null;
  }

  private construct<T>(
    ctor: constructor<T> | DelayedConstructor<T>,
    context: ResolutionContext
  ): T {
    if (ctor instanceof DelayedConstructor) {
      return ctor.createProxy((target: constructor<T>) =>
        this.resolve(target, context)
      );
    }

    if (ctor.length === 0) {
      return new ctor();
    }

    const paramInfo = typeInfo.get(ctor);

    if (!paramInfo || paramInfo.length === 0) {
      throw new Error(`TypeInfo not known for "${ctor.name}"`);
    }

    const params = paramInfo.map(this.resolveParams(context, ctor));

    return new ctor(...params);
  }

  private resolveParams<T>(context: ResolutionContext, ctor: constructor<T>) {
    return (param: ParamInfo, idx: number) => {
      try {
        if (isTokenDescriptor(param)) {
          return param.multiple
            ? this.resolveAll(param.token)
            : this.resolve(param.token, context);
        }
        return this.resolve(param, context);
      } catch (e) {
        throw new Error(formatErrorCtor(ctor, idx, e));
      }
    };
  }
}

export const instance: DependencyContainer = new InternalDependencyContainer();

export default instance;
