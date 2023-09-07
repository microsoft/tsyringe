import {defineInjectionTokenMetadata} from "../reflection-helpers.ts";
import InjectionToken, {
  TokenDescriptor,
  TransformDescriptor
} from "../providers/injection-token.ts";
import Transform from "../types/transform.ts";

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
function injectAllWithTransform(
  token: InjectionToken<any>,
  transformer: InjectionToken<Transform<[any], any>>,
  ...args: any[]
): (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => any {
  const data: TokenDescriptor | TransformDescriptor = {
    token,
    multiple: true,
    transform: transformer,
    transformArgs: args
  };
  return defineInjectionTokenMetadata(data);
}

export default injectAllWithTransform;
