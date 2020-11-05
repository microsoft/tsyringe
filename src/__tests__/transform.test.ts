import { inject } from "../decorators";

test("Intercepting parameter resolution should work", () => {
    class Foo {
        constructor(@transform(BarTransform, "Hello") @inject(Bar) public value: string){}
    }

    class Bar {
        public getValue(str: string){
            return `You passed in ${str}!`;
        }
    }

    class BarTransform implements Transform {
        public transform(str: string)
    }
});