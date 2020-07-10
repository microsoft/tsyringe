import DependencyContainer from "../types/dependency-container";
import FactoryFunction from "./factory-function";

export default function instanceCachingFactory<T>(
  factoryFunc: FactoryFunction<T>
): FactoryFunction<T> {
  let instance: T;
  return async (dependencyContainer: DependencyContainer) => {
    if (instance == undefined) {
      instance = await factoryFunc(dependencyContainer);
    }
    return instance;
  };
}
