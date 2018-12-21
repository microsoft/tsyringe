import {DependencyContainer} from "./types";
import {instance} from "./dependency-container";

export {DependencyContainer} from "./types";
export * from "./decorators";
export * from "./factories";
export * from "./providers";
export const container: DependencyContainer = instance;
