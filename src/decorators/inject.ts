import {INJECTION_TOKEN_METADATA_KEY} from "../reflection-helpers";
import InjectionToken from "../providers/injection-token";

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
function inject(
  token: InjectionToken<any>
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  return function(
    target: any,
    _propertyKey: string | symbol,
    parameterIndex: number
  ): any {
    const injectionTokens =
      Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    injectionTokens[parameterIndex] = token;
    Reflect.defineMetadata(
      INJECTION_TOKEN_METADATA_KEY,
      injectionTokens,
      target
    );
  };
}

export default inject;
