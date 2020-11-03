import { PreResolutionInterceptorCallback } from './dependency-container';
import RegistryBase from './registry-base';
import { InterceptionOptions } from './types';

export type PreResolutionInterceptor = {
    callback: PreResolutionInterceptorCallback,
    options: InterceptionOptions
}

export default class Interceptors extends RegistryBase<PreResolutionInterceptor> {
}
