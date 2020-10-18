export default interface Disposable {
  dispose(): void;
}

export function isDisposable(value: any): value is Disposable {
  if (typeof value.dispose !== "function") return false;

  const disposeFun: Function = value.dispose;

  // `.dispose()` takes in no arguments
  if (disposeFun.length > 0) {
    return false;
  }

  return true;
}
