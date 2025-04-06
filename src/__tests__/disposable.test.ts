import Disposable, {isDisposable} from "../types/disposable";

describe("Disposable", () => {
  describe("isDisposable", () => {
    it("returns false for non-disposable object", () => {
      const nonDisposable = {};

      expect(isDisposable(nonDisposable)).toBeFalsy();
    });

    it("returns false when dispose method takes too many args", () => {
      const specialDisposable = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dispose(_: any) {}
      };

      expect(isDisposable(specialDisposable)).toBeFalsy();
    });

    it("returns true for disposable object", () => {
      const disposable: Disposable = {
        dispose() {}
      };

      expect(isDisposable(disposable)).toBeTruthy();
    });
  });
});
