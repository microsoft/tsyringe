import "reflect-metadata";

import DependencyContainer from "./dependency-container";

import { InjectionToken, Provider } from "./providers";
import { constructor, Dictionary } from "./types";

const injectionTokenMetadataKey = "injectionTokens";
const reservedNames = ["length", "name", "arguments", "caller", "prototype"];

/**
 * Class decorator factory that allows the class' dependencies to be
 * automatically injected at runtime.
 *
 * @return {Function} The class decorator
 */
export function injectable(): (target: constructor<any>) => any {
    return function<T>(target: constructor<T>): constructor<T> {
        const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
        const injectionTokens: Dictionary<InjectionToken<any>> = Reflect.getOwnMetadata(injectionTokenMetadataKey, target) || {};
        Object.keys(injectionTokens).forEach(key => {
            params[+key] = injectionTokens[key];
        });

        const injectedConstructor: any = function(this: Object, ...args: any[]): any {
            const resolvedArgs = args.slice();
            params.slice(args.length).forEach(param => {
                resolvedArgs.push(DependencyContainer.resolve(param));
            });

            return new target(...resolvedArgs);
        };

        injectedConstructor.prototype = target.prototype;
        Object.getOwnPropertyNames(target).forEach(key => {
            if (!reservedNames.some(name => name === key) && (<any>injectedConstructor)[key] == undefined) {
                (<any>injectedConstructor)[key] = (<any>target)[key];
            }
        });

        return injectedConstructor;
    };
}

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
export function inject(token: InjectionToken<any>): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
    return function(target: any, _propertyKey: string | symbol, parameterIndex: number): any {
        const injectionTokens = Reflect.getOwnMetadata(injectionTokenMetadataKey, target) || {};
        injectionTokens[parameterIndex] = token;
        Reflect.defineMetadata(injectionTokenMetadataKey, injectionTokens, target);
    };
}

/**
 * Class decorator factory that allows constructor dependencies to be registered at runtime.
 *
 * @return {Function} The class decorator
 */
export function registry(providers: Provider<any>[] = []): (target: any) => any {
    return function(target: any): any {
        providers.forEach(provider => DependencyContainer.register(provider));

        return target;
    };
}
