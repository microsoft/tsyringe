import constructor from "../types/constructor";
import {getParamInfo} from "../reflection-helpers";
import {instance as globalContainer} from "../dependency-container";
import {
  isTokenDescriptor,
  isTransformDescriptor
} from "../providers/injection-token";
import {formatErrorCtor} from "../error-helpers";
import {__extends} from "tslib";

/**
 * Class decorator factory that replaces the decorated class' constructor with
 * a parameterless constructor that has dependencies auto-resolved
 *
 * Note: Resolution is performed using the global container
 *
 * @return {Function} The class decorator
 */
function autoInjectable(): (target: constructor<any>) => any {
  return function(target: constructor<any>): constructor<any> {
    const paramInfo = getParamInfo(target);
    return (function(_super): any {
      function extendedClazz(...args: any[]) {
        const SuperProxy = new Proxy(_super, {
          // target = Foo
          apply(target, _, argumentsList) {
            return new target(...argumentsList);
          }
        });
        return SuperProxy.call(
          null,
          ...args.concat(
            paramInfo.slice(args.length).map((type, index) => {
              try {
                if (isTokenDescriptor(type)) {
                  if (isTransformDescriptor(type)) {
                    return type.multiple
                      ? globalContainer
                          .resolve(type.transform)
                          .transform(
                            globalContainer.resolveAll(type.token),
                            ...type.transformArgs
                          )
                      : globalContainer
                          .resolve(type.transform)
                          .transform(
                            globalContainer.resolve(type.token),
                            ...type.transformArgs
                          );
                  } else {
                    return type.multiple
                      ? globalContainer.resolveAll(type.token)
                      : globalContainer.resolve(type.token);
                  }
                } else if (isTransformDescriptor(type)) {
                  return globalContainer
                    .resolve(type.transform)
                    .transform(
                      globalContainer.resolve(type.token),
                      ...type.transformArgs
                    );
                }
                return globalContainer.resolve(type);
              } catch (e) {
                const argIndex = index + args.length;
                throw new Error(formatErrorCtor(target, argIndex, e as Error));
              }
            })
          )
        );
      }
      __extends(extendedClazz, _super);
      return extendedClazz;
    })(target);
  };
}

export default autoInjectable;
