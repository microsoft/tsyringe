import "reflect-metadata";

import * as Types from "./types";
import {instance as globalContainer, typeInfo} from "./dependency-container";
import { InjectionToken, Provider } from "./providers";
import { constructor, Dictionary } from "./types";

const injectionTokenMetadataKey = "injectionTokens";

/**
 * Class decorator factory that allows the class' dependencies to be
 * automatically injected at runtime.
 *
 * @return {Function} The class decorator
 */
export function injectable<T>(): (target: constructor<T>) => void {
    return function(target: constructor<T>): void {
        const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
        const injectionTokens: Dictionary<InjectionToken<any>> = Reflect.getOwnMetadata(injectionTokenMetadataKey, target) || {};
        Object.keys(injectionTokens).forEach(key => {
            params[+key] = injectionTokens[key];
        });

        typeInfo.set(target, params);
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
export function registry(providers: Provider<any>[] = [], container?: Types.DependencyContainer): (target: any) => any {
    return function(target: any): any {
        providers.forEach(provider => (container || globalContainer).register(provider));

        return target;
    };
}
