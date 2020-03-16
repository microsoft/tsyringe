import DependencyContainer from "../types/dependency-container";

type FactoryFunction<T> = (
  dependencyContainer: DependencyContainer
) => Promise<T>;

export default FactoryFunction;
