import {ParamInfo} from "./dependency-container";
import InjectionToken, {TokenDescriptor} from "./providers/injection-token";
import constructor from "./types/constructor";
import Dictionary from "./types/dictionary";

export type LazyInjectInfo = Map<string | symbol, TokenDescriptor>;

export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
export const LAZY_INJECTION_TOKEN_METADATA_KEY = "tsyringe.lazyInjectionTokens";

export function getParamInfo(target: constructor<any>): ParamInfo[] {
  const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
  const injectionTokens: Dictionary<InjectionToken<any>> =
    Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
  Object.keys(injectionTokens).forEach(key => {
    params[+key] = injectionTokens[key];
  });

  return params;
}

export function defineInjectionTokenMetadata(
  data: any
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return function(
    target: any,
    _propertyKey: string | symbol,
    parameterIndex: number
  ): any {
    const injectionTokens =
      Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    injectionTokens[parameterIndex] = data;
    Reflect.defineMetadata(
      INJECTION_TOKEN_METADATA_KEY,
      injectionTokens,
      target
    );
  };
}

export function getLazyInjectInfo(target: object): LazyInjectInfo {
  return (
    Reflect.getMetadata(LAZY_INJECTION_TOKEN_METADATA_KEY, target) || new Map()
  );
}

export function defineLazyInjectionTokenMetadata(
  tokenDescriptor: TokenDescriptor
): PropertyDecorator {
  return function(target, propertyKey) {
    const lazyInjectionInfo: LazyInjectInfo =
      Reflect.getOwnMetadata(
        LAZY_INJECTION_TOKEN_METADATA_KEY,
        target.constructor
      ) || new Map();
    lazyInjectionInfo.set(propertyKey, tokenDescriptor);
    Reflect.defineMetadata(
      LAZY_INJECTION_TOKEN_METADATA_KEY,
      lazyInjectionInfo,
      target.constructor
    );
  };
}
