import * as decorators from "./decorators";
import * as factories from "./factories";
import * as providers from "./providers";
import * as Types from "./types";
import {instance} from "./dependency-container";

export {DependencyContainer} from "./types";
export {factories};
export {providers};
export {decorators};
export const container: Types.DependencyContainer = instance;
