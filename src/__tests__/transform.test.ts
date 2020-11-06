import {container} from "..";
import {injectable} from "../decorators";
import injectWithTransform from "../decorators/inject-with-transform";
import { Transform } from '../types/transform';

test("Injecting with transform should work", () => {
  class Bar {}

  class BarTransform {
    public transform(): string {
      return "Transformed from bar";
    }
  }

  @injectable()
  class Foo {
    constructor(@injectWithTransform(Bar, BarTransform) public value: string) {}
  }

  const result = container.resolve(Foo);

  expect(result.value).toEqual("Transformed from bar");
});

test("Injecting with transform should work passing a parameter from the decorator", () => {
  class Bar {
      public repeat(str: string){
          return str + str;
      }
  }

  class BarTransform implements Transform<Bar, string>{
    public transform(bar: Bar, str: string): string {
      return bar.repeat(str);
    }
  }

  @injectable()
  class Foo {
    constructor(@injectWithTransform(Bar, BarTransform, "b") public value: string) {}
  }

  const result = container.resolve(Foo);

  expect(result.value).toEqual("bb");
});

test("Injecting with transform should work passing parameters from the decorator", () => {
  class Bar {
      public concat(str1: string, str2: string){
          return str1 + str2;
      }
  }

  class BarTransform implements Transform<Bar, string>{
    public transform(bar: Bar, str1: string, str2: string): string {
      return bar.concat(str1, str2);
    }
  }

  @injectable()
  class Foo {
    constructor(@injectWithTransform(Bar, BarTransform, "a", "b") public value: string) {}
  }

  const result = container.resolve(Foo);

  expect(result.value).toEqual("ab");
});
