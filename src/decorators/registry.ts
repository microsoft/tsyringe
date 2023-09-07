import Provider from "../providers/provider.ts";
import InjectionToken from "../providers/injection-token.ts";
import RegistrationOptions from "../types/registration-options.ts";
import {instance as globalContainer} from "../dependency-container.ts";

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
    registrations.forEach(({token, options, ...provider}) =>
      globalContainer.register(token, provider as any, options)
    );

    return target;
  };
}

export default registry;
