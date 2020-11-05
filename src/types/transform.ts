import { DependencyContainer } from '.';
import { InjectionToken } from "..";

type Transform<T> = { transform: (incoming: InjectionToken<T>, container: DependencyContainer) => any }