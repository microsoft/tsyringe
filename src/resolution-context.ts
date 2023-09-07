import {Registration} from "./dependency-container.ts";

export default class ResolutionContext {
  scopedResolutions: Map<Registration, any> = new Map();
}
