import constructor from "../types/constructor";
import {getParamInfo, PARAM_INFOS_METADATA_KEY} from "../reflection-helpers";

/**
 * Class decorator factory that allows the class' dependencies to be injected
 * at runtime.
 *
 * @return {Function} The class decorator
 */
function injectable<T>(): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    const paramInfo = getParamInfo(target);

    Reflect.defineMetadata(PARAM_INFOS_METADATA_KEY, paramInfo, target);
  };
}

export default injectable;
