import * as decorators from "./decorators";
import * as factories from "./factories";
import * as providers from "./providers";
import {DependencyContainer} from "./types";
import container from "./dependency-container";

export {DependencyContainer} from "./types";
export const lib = {
  decorators,
  factories,
  providers,
  container: container as DependencyContainer
};
