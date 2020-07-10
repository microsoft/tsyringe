import {resolveParams} from "../resolve-params";
import {DependencyContainer} from "../types";

const initializersKey = Symbol("initializers");
const initializationPromiseKey = Symbol("initializationPromise");

/**
 * Method decorator factory that results in the async method it is applied to being called
 *
 * @return {Function} The method decorator
 */
function initializer(): (
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => any {
  return function(
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): any {
    const originalMethod = descriptor.value;
    if (target[initializersKey] == null) {
      target[initializersKey] = [];
    }
    target[initializersKey].push(async function(
      container: DependencyContainer,
      object: any
    ) {
      const args = await resolveParams(container, target, propertyKey);
      await originalMethod.apply(object, args);
    });
  };
}

async function createInitializationPromise(
  container: DependencyContainer,
  object: any
): Promise<void> {
  const initializers = object.constructor.prototype[initializersKey];
  if (initializers != null) {
    for (const initializer of initializers) {
      await initializer(container, object);
    }
  }
}

export async function callInitializers(
  container: DependencyContainer,
  object: any
): Promise<void> {
  if (
    object != null &&
    object.constructor != null &&
    object.constructor.prototype != null &&
    object.constructor.prototype[initializersKey] != null
  ) {
    if (object[initializationPromiseKey] == null) {
      object[initializationPromiseKey] = createInitializationPromise(
        container,
        object
      );
    }
    await object[initializationPromiseKey];
  }
}

export default initializer;
