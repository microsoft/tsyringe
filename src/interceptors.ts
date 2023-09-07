import RegistryBase from "./registry-base.ts";
import {InterceptionOptions} from "./types/index.ts";
import {
  PostResolutionInterceptorCallback,
  PreResolutionInterceptorCallback
} from "./types/dependency-container.ts";

export type PreResolutionInterceptor = {
  callback: PreResolutionInterceptorCallback;
  options: InterceptionOptions;
};

export type PostResolutionInterceptor = {
  callback: PostResolutionInterceptorCallback;
  options: InterceptionOptions;
};

export class PreResolutionInterceptors extends RegistryBase<
  PreResolutionInterceptor
> {}

export class PostResolutionInterceptors extends RegistryBase<
  PostResolutionInterceptor
> {}

export default class Interceptors {
  public preResolution: PreResolutionInterceptors = new PreResolutionInterceptors();
  public postResolution: PostResolutionInterceptors = new PostResolutionInterceptors();
}
