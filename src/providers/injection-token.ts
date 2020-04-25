import constructor from "../types/constructor";
import {DelayedConstructor} from "../lazy-helpers";

type InjectionToken<T = any> =
  | constructor<T>
  | string
  | symbol
  | DelayedConstructor<T>;

export function isNormalToken(
  token?: InjectionToken<any>
): token is string | symbol {
  return typeof token === "string" || typeof token === "symbol";
}

export function isTokenDescriptor(
  descriptor: any
): descriptor is TokenDescriptor {
  return (
    typeof descriptor === "object" &&
    "token" in descriptor &&
    "multiple" in descriptor
  );
}

export function isConstructorToken(
  token?: InjectionToken<any>
): token is constructor<any> | DelayedConstructor<any> {
  return typeof token === "function" || token instanceof DelayedConstructor;
}

export interface TokenDescriptor {
  token: InjectionToken<any>;
  multiple: boolean;
}

export default InjectionToken;
