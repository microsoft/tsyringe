import {InjectionToken} from "../providers";
import {defineLazyInjectionTokenMetadata} from "../reflection-helpers";

function lazyInjectAll(token: InjectionToken): PropertyDecorator {
  return defineLazyInjectionTokenMetadata({
    multiple: true,
    token
  });
}

export default lazyInjectAll;
