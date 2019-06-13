import constructor from "../types/constructor";
import injectable from "./injectable";
import {instance as globalContainer} from "../dependency-container";
import {InjectionToken} from "../providers";

/**
 * Class decorator factory that registers the class as a scoped dependency within
 * the global container.
 *
 * @return {Function} The class decorator
 */
function scoped<T>(
  token?: InjectionToken<any>
): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    injectable()(target);
    globalContainer.registerScoped(token || target, target);
  };
}

export default scoped;
