import constructor from "../types/constructor";

type InjectionToken<T = any> = constructor<T> | string | symbol;

export function isNormalToken(
  token?: InjectionToken<any>
): token is string | symbol {
  return typeof token === "string" || typeof token === "symbol";
}

export default InjectionToken;
