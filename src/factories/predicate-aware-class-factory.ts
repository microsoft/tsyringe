import DependencyContainer from "../types/dependency-container";
import constructor from "../types/constructor";
import FactoryFunction from "./factory-function";

export default function predicateAwareClassFactory<T>(
  predicate: (
    dependencyContainer: DependencyContainer,
    target?: constructor<T>
  ) => boolean,
  trueConstructor: constructor<T>,
  falseConstructor: constructor<T>,
  useCaching = true
): FactoryFunction<T> {
  let instance: T;
  let previousPredicate: boolean;
  return (
    dependencyContainer: DependencyContainer,
    target?: constructor<T>
  ) => {
    const currentPredicate = predicate(dependencyContainer, target);
    if (!useCaching || previousPredicate !== currentPredicate) {
      if ((previousPredicate = currentPredicate)) {
        instance = dependencyContainer.resolve(trueConstructor, target);
      } else {
        instance = dependencyContainer.resolve(falseConstructor, target);
      }
    }
    return instance;
  };
}
