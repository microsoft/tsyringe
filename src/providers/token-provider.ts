import InjectionToken from "./injection-token.ts";
import Provider from "./provider.ts";

export default interface TokenProvider<T> {
  useToken: InjectionToken<T>;
}

export function isTokenProvider<T>(
  provider: Provider<T>
): provider is TokenProvider<any> {
  return !!(provider as TokenProvider<T>).useToken;
}
