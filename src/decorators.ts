import "reflect-metadata";

import * as Types from "./types";
import {DependencyContainer, instance as globalContainer} from "./dependency-container";
import { InjectionToken, Provider } from "./providers";
import { constructor, Dictionary } from "./types";

const injectionTokenMetadataKey = "injectionTokens";

/**
 * Class decorator factory that allows the class' dependencies to be
 * automatically injected at runtime.
 *
 * @return {Function} The class decorator
 */
export function injectable(): (target: constructor<any>) => any {
    return function(target: constructor<any>): constructor<any> {
        const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
        const injectionTokens: Dictionary<InjectionToken<any>> = Reflect.getOwnMetadata(injectionTokenMetadataKey, target) || {};
        Object.keys(injectionTokens).forEach(key => {
            params[+key] = injectionTokens[key];
        });

        return class extends target {
          constructor(...args: any[]) {
            let container = globalContainer;

            if (args[0] instanceof DependencyContainer) {
              container = args.shift();
            }

            const resolvedArgs = args.slice();
            params.slice(args.length).forEach(param => {
                resolvedArgs.push(container.resolve(param));
            });

            super(...resolvedArgs);
          }
        }
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
