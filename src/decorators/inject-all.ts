import {defineInjectionTokenMetadata} from "../reflection-helpers";
import InjectionToken, {TokenDescriptor} from "../providers/injection-token";

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
function injectAll(
  token: InjectionToken<any>,
  options?: {isOptional?: boolean}
): (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => any {
  const data: TokenDescriptor = {
    token,
    multiple: true,
    isOptional: options && options.isOptional
  };
  return defineInjectionTokenMetadata(data);
}

export default injectAll;
