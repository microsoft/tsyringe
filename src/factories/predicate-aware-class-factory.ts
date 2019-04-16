import DependencyContainer from "../types/dependency-container";
import constructor from "../types/constructor";
import FactoryFunction from "./factory-function";

export default function predicateAwareClassFactory<T>(
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
