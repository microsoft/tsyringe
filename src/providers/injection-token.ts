import constructor from "../types/constructor";

type InjectionToken<T = any> = constructor<T> | string | symbol;

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

export interface TokenDescriptor {
  token: InjectionToken<any>;
  multiple: boolean;
}

export default InjectionToken;
