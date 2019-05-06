import constructor from "../types/constructor";
import injectable from "./injectable";
import {instance as globalContainer} from "../dependency-container";

/**
 * Class decorator factory that registers the class as a scoped service.
 *
 * @return {Function} The class decorator
 */
function scoped<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    injectable()(target);
    globalContainer.registerScoped(target);
  };
}

export default scoped;
