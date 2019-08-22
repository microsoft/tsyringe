import DependencyContainer from "../types/dependency-container";
import FactoryFunction from "./factory-function";
import {constructor} from "../types";

export default function instanceCachingFactory<T>(
  factoryFunc: FactoryFunction<T>
): FactoryFunction<T> {
  let instance: T;
  return (
    dependencyContainer: DependencyContainer,
    target?: constructor<T>
  ) => {
    if (instance == undefined) {
      instance = factoryFunc(dependencyContainer, target);
    }
    return instance;
  };
}
