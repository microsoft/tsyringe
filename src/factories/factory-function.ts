import DependencyContainer from "../types/dependency-container";

type FactoryFunction<T> = (dependencyContainer: DependencyContainer) => T;

export default FactoryFunction;
