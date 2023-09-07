import constructor from "../types/constructor.ts";
import injectable from "./injectable.ts";
import {instance as globalContainer} from "../dependency-container.ts";
import {InjectionToken} from "../providers/index.ts";
import Lifecycle from "../types/lifecycle.ts";

/**
 * Class decorator factory that registers the class as a scoped dependency within
 * the global container.
 *
 * @return The class decorator
 */
export default function scoped<T>(
  lifecycle: Lifecycle.ContainerScoped | Lifecycle.ResolutionScoped,
  token?: InjectionToken<T>
): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    injectable()(target);
    globalContainer.register(token || target, target, {
      lifecycle
    });
  };
}
