import "reflect-metadata";

import {INJECTION_TOKEN_METADATA_KEY, getParamInfo} from "./reflection-helpers";
import {InjectionToken, Provider} from "./providers";
import {RegistrationOptions, constructor} from "./types";
import {instance as globalContainer, typeInfo} from "./dependency-container";

/**
 * Class decorator factory that allows the class' dependencies to be injected
 * at runtime.
 *
 * @return {Function} The class decorator
 */
export function injectable<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    typeInfo.set(target, getParamInfo(target));
  };
}

/**
 * Class decorator factory that registers the class as a singleton within
 * the global container.
 *
 * @return {Function} The class decorator
 */
export function singleton<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    globalContainer.registerSingleton(target);
  };
}

/**
 * Class decorator factory that replaces the decorated class' constructor with
 * a parameterless constructor that has dependencies auto-resolved
 *
 * Note: Resolution is performed using the global container
 *
 * @return {Function} The class decorator
 */
export function autoInjectable(): (target: constructor<any>) => any {
  return function(target: constructor<any>): constructor<any> {
    const paramInfo = getParamInfo(target);

    return class extends target {
      constructor(...args: any[]) {
        super(...args.concat(paramInfo.slice(args.length).map(type => globalContainer.resolve(type))));
      }
    };
  };
}

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
export function inject(token: InjectionToken<any>): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return function(target: any, _propertyKey: string | symbol, parameterIndex: number): any {
    const injectionTokens = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    injectionTokens[parameterIndex] = token;
    Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, injectionTokens, target);
  };
}

/**
 * Class decorator factory that allows constructor dependencies to be registered at runtime.
 *
 * @return {Function} The class decorator
 */
export function registry(registrations: ({ token: InjectionToken, options?: RegistrationOptions } & Provider<any>)[] = []): (target: any) => any {
  return function(target: any): any {
    registrations.forEach(({token, options, ...provider}) => globalContainer.register(token, <any>provider, options));

    return target;
  };
}
