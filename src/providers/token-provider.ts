import InjectionToken from "./injection-token";
import Provider from "./provider";

export default interface TokenProvider<T> {
  useToken: InjectionToken<T>;
}

export function isTokenProvider<T>(
  provider: Provider<T>
): provider is TokenProvider<any> {
  return !!(provider as TokenProvider<T>).useToken;
}
