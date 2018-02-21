import {InjectionToken} from "./providers";
import {Dictionary, constructor} from "./types";

export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";

export function getParamInfo(target: constructor<any>): any[] {
  const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
  const injectionTokens: Dictionary<InjectionToken<any>> = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
  Object.keys(injectionTokens).forEach(key => {
      params[+key] = injectionTokens[key];
  });

  return params;
}
