import {PreResolutionInterceptorCallback} from "./dependency-container";
import RegistryBase from "./registry-base";
import {InterceptionOptions} from "./types";

export type PreResolutionInterceptor = {
  callback: PreResolutionInterceptorCallback;
  options: InterceptionOptions;
};

export class PreResolutionInterceptors extends RegistryBase<
  PreResolutionInterceptor
> {}

export default class Interceptors {
    public preResolution: PreResolutionInterceptors = new PreResolutionInterceptors();
}
