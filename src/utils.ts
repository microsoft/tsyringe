export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  let wasRun = false;
  let result!: ReturnType<T>;
  return function(this: any, ...args: any[]) {
    if (wasRun) {
      return result;
    }
    wasRun = true;
    return (result = fn.apply(this, args));
  } as T;
}
