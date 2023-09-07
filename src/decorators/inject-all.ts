import {defineInjectionTokenMetadata} from "../reflection-helpers.ts";
import InjectionToken, {TokenDescriptor} from "../providers/injection-token.ts";

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
function injectAll(
  token: InjectionToken<any>
): (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => any {
  const data: TokenDescriptor = {token, multiple: true};
  return defineInjectionTokenMetadata(data);
}

export default injectAll;
