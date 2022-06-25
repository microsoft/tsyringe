import Dictionary from "./types/dictionary";
import constructor from "./types/constructor";
import InjectionToken, {TokenDescriptor} from "./providers/injection-token";
import {ParamInfo} from "./dependency-container";
import Transform from "./types/transform";

export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
export const PARAM_INFOS_METADATA_KEY = "paramInfos";

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
  data: any,
  transform?: {transformToken: InjectionToken<Transform<any, any>>; args: any[]}
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return function(
    target: any,
    _propertyKey: string | symbol,
    parameterIndex: number
  ): any {
    const descriptors: Dictionary<InjectionToken<any> | TokenDescriptor> =
      Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    descriptors[parameterIndex] = transform
      ? {
          token: data,
          transform: transform.transformToken,
          transformArgs: transform.args || []
        }
      : data;
    Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, descriptors, target);
  };
}
