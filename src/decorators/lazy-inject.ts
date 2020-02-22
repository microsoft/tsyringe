import {InjectionToken} from "../providers";
import {defineLazyInjectionTokenMetadata} from "../reflection-helpers";

function lazyInject(token: InjectionToken): PropertyDecorator {
  return defineLazyInjectionTokenMetadata({
    multiple: false,
    token
  });
}

export default lazyInject;
