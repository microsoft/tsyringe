import { InjectionToken, Provider } from "../providers";
import { RegistrationOptions } from "../types";
import { instance as globalContainer } from "../dependency-container";

/**
 * Class decorator factory that allows constructor dependencies to be registered at runtime.
 *
 * @return {Function} The class decorator
 */
function registry(
  registrations: ({
    token: InjectionToken;
    options?: RegistrationOptions;
  } & Provider<any>)[] = []
): (target: any) => any {
  return function(target: any): any {
    registrations.forEach(({ token, options, ...provider }) =>
      globalContainer.register(token, <any>provider, options)
    );

    return target;
  };
}

export default registry;
