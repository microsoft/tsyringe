import {defineInjectionTokenMetadata} from "../reflection-helpers";
import InjectionToken, {TokenDescriptor} from "../providers/injection-token";
import {Provider} from "../providers";
import {instance as globalContainer} from "../dependency-container";

/**
 * Parameter decorator factory that allows for interface information to be stored in the constructor's metadata
 *
 * @return {Function} The parameter decorator
 */
function inject(
  token: InjectionToken<any>,
  options?: {
    isOptional?: boolean;
    defaultProvider?: Provider<any>;
  }
): (
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
) => any {
  const data: TokenDescriptor = {
    token,
    multiple: false,
    isOptional: options && options.isOptional
  };

  if (options && options.defaultProvider) {
    // @ts-expect-error options.defaultProvider is the right type but this Typescript version doesn't seem to realize that one of the overloads method would accept this type.
    globalContainer.register(token, options.defaultProvider);
  }

  return defineInjectionTokenMetadata(data);
}

export default inject;
