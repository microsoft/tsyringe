import DependencyContainer from "../types/dependency-container";
import FactoryFunction from "./factory-function";

export default function instanceCachingFactory<T>(
  factoryFunc: FactoryFunction<T>
): FactoryFunction<T> {
  let instance: T;
  return (dependencyContainer: DependencyContainer) => {
    if (instance == undefined) {
      instance = factoryFunc(dependencyContainer);
    }
    return instance;
  };
}
