import {DependencyContainer} from "./types";
import {instance} from "./dependency-container";

if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
  throw `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`;
}

export {DependencyContainer} from "./types";
export * from "./decorators";
export * from "./factories";
export * from "./providers";
export const container: DependencyContainer = instance;
