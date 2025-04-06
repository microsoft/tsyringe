export default interface Disposable {
  dispose(): Promise<void> | void;
}

export function isDisposable(value: any): value is Disposable {
  if (typeof value.dispose !== "function") return false;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const disposeFun: Function = value.dispose;

  // `.dispose()` takes in no arguments
  if (disposeFun.length > 0) {
    return false;
  }

  return true;
}
