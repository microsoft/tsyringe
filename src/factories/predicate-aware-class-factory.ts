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
  return async (dependencyContainer: DependencyContainer) => {
    const currentPredicate = predicate(dependencyContainer);
    if (!useCaching || previousPredicate !== currentPredicate) {
      if ((previousPredicate = currentPredicate)) {
        instance = await dependencyContainer.resolve(trueConstructor);
      } else {
        instance = await dependencyContainer.resolve(falseConstructor);
      }
    }
    return instance;
  };
}
