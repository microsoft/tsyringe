import Dictionary from "./types/dictionary";
import InjectionToken from "./providers/injection-token";
import {ParamInfo} from "./dependency-container";

export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";

// The following is a patch of tsyringe's internal getParamInfo to support method parameters
export function getParamInfo(
  target: any,
  propertyKey: string | symbol | undefined = undefined
): ParamInfo[] {
  let params: any[] = [];
  params = propertyKey
    ? Reflect.getMetadata("design:paramtypes", target, propertyKey) || []
    : Reflect.getMetadata("design:paramtypes", target) || [];

  const injectionTokens: Dictionary<InjectionToken<any>> = propertyKey
    ? Reflect.getOwnMetadata(
        INJECTION_TOKEN_METADATA_KEY,
        target,
        propertyKey
      ) || {}
    : Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};

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
    propertyKey: string | symbol,
    parameterIndex: number
  ): any {
    const injectionTokens: Dictionary<InjectionToken<any>> = propertyKey
      ? Reflect.getOwnMetadata(
          INJECTION_TOKEN_METADATA_KEY,
          target,
          propertyKey
        ) || {}
      : Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    injectionTokens[parameterIndex] = data;

    if (propertyKey) {
      Reflect.defineMetadata(
        INJECTION_TOKEN_METADATA_KEY,
        injectionTokens,
        target,
        propertyKey
      );
    } else {
      Reflect.defineMetadata(
        INJECTION_TOKEN_METADATA_KEY,
        injectionTokens,
        target
      );
    }
  };
}
