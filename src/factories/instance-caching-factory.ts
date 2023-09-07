import DependencyContainer from "../types/dependency-container.ts";
import FactoryFunction from "./factory-function.ts";

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
