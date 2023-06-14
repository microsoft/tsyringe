import {InjectionToken} from "../providers";
import {defineInjectionTokenMetadata} from "../reflection-helpers";
import Transform from "../types/transform";

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata with a transform token
 * @param token The token of the object to be resolved
 * @param transformer The token of the transform object
 * @param args Arguments to be passed to the transform method on the transformer
 * @returns The parameter decorator
 */
function injectWithTransform(
  token: InjectionToken<any>,
  transformer: InjectionToken<Transform<any, any>>,
  ...args: any[]
): (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => any {
  return defineInjectionTokenMetadata(token, {
    transformToken: transformer,
    args: args
  });
}

export default injectWithTransform;
