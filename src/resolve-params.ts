import {getParamInfo} from "./reflection-helpers";
import DependencyContainer from "./types/dependency-container";
import {isTokenDescriptor} from "./providers/injection-token";
import {formatErrorCtor} from "./error-helpers";

export async function resolveParams(
  container: DependencyContainer,
  target: any,
  propertyKey: string | symbol | undefined = undefined,
  ...args: any[]
): Promise<any[]> {
  const paramInfo = getParamInfo(target, propertyKey);
  const resolvedArgs = [...args];
  const types = paramInfo.slice(args.length) as any;
  let index = 0;
  for (const type of types) {
    try {
      if (isTokenDescriptor(type)) {
        resolvedArgs.push(
          type.multiple
            ? await container.resolveAll(type.token)
            : await container.resolve(type.token)
        );
      }
      resolvedArgs.push(await container.resolve(type));
    } catch (e) {
      const argIndex = index + args.length;
      throw new Error(formatErrorCtor(target, argIndex, e));
    }
    index += 1;
  }
  return resolvedArgs;
}
