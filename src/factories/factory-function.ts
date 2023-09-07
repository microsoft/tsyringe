import DependencyContainer from "../types/dependency-container.ts";

type FactoryFunction<T> = (dependencyContainer: DependencyContainer) => T;

export default FactoryFunction;
