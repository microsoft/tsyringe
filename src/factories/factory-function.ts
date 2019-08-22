import DependencyContainer from "../types/dependency-container";
import {constructor} from "../types";

type FactoryFunction<T> = (
  dependencyContainer: DependencyContainer,
  target?: constructor<T>
) => T;

export default FactoryFunction;
