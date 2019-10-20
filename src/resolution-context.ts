import {Registration} from "./dependency-container";

export default class ResolutionContext {
  scopedResolutions: Map<Registration, any> = new Map();
}
