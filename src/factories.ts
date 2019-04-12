import {DependencyContainer, constructor} from "./types";

export type FactoryFunction<T> = (
  dependencyContainer: DependencyContainer
) => T;

export function instanceCachingFactory<T>(
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

export function predicateAwareClassFactory<T>(
  predicate: (dependencyContainer: DependencyContainer) => boolean,
  trueConstructor: constructor<T>,
  falseConstructor: constructor<T>,
  useCaching = true
): FactoryFunction<T> {
  let instance: T;
  let previousPredicate: boolean;

  return (dependencyContainer: DependencyContainer) => {
    const currentPredicate = predicate(dependencyContainer);
    if (!useCaching || previousPredicate !== currentPredicate) {
      if ((previousPredicate = currentPredicate)) {
        instance = dependencyContainer.resolve(trueConstructor);
      } else {
        instance = dependencyContainer.resolve(falseConstructor);
      }
    }

    return instance;
  };
}
