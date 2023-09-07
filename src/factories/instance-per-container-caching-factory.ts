import DependencyContainer from "../types/dependency-container.ts";
import FactoryFunction from "./factory-function.ts";

export default function instancePerContainerCachingFactory<T>(
  factoryFunc: FactoryFunction<T>
): FactoryFunction<T> {
  const cache = new WeakMap<DependencyContainer, T>();
  return (dependencyContainer: DependencyContainer) => {
    let instance = cache.get(dependencyContainer);
    if (instance == undefined) {
      instance = factoryFunc(dependencyContainer);
      cache.set(dependencyContainer, instance);
    }
    return instance;
  };
}
