[![Travis](https://img.shields.io/travis/Microsoft/tsyringe.svg)](https://travis-ci.org/Microsoft/tsyringe/)

# TSyringe

A lightweight dependency injection container for TypeScript/TypeScript for
constructor injection.

## Installation

```sh
npm install --save tsyringe
```

Modify your `tsconfig.json` to include the following settings
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Usage
### Example without interfaces
Since classes have type information at runtime, we can resolve them without any
extra information. If a particular class isn't registered with the container then
a new instance will be resolved each time.

```TypeScript
// Foo.ts
export class Foo {}
```
```TypeScript
// Bar.ts
import {Foo} from "./Foo";
import {decorators} from "tsyringe";
const {injectable} = decorators;

@injectable()
export class Bar {
  constructor(public myFoo: Foo) {}
}
```
```TypeScript
// main.ts
import {container} from "tsyringe";
import {Bar} from "./Bar";

const myBar = container.resolve(Bar);
// myBar.myFoo => An instance of Foo
```

### Example with interfaces
Interfaces don't have type information at runtime, so we need to decorate them
with `@inject(...)` so the container knows how to resolve them.

```TypeScript
// SuperService.ts
export interface SuperService {
  // ...
}
```
```TypeScript
// TestService.ts
import {SuperService} from "./SuperService";
export class TestService implements SuperService {
  //...
}
```
```TypeScript
// Client.ts
import {decorators} from "tsyringe";
const {injectable, inject} = decorators;

@injectable()
export class Client {
  constructor(@inject("SuperService") private service: SuperService) {}
}
```
```TypeScript
// main.ts
import {Client} from "./Client";
import {TestService} from "./TestService";
import {container} from "tsyringe";

container.register({
  token: "SuperService",
  useClass: TestService
});

const client = container.resolve(Client);
// client's dependencies will have been resolved
```

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [https://cla.microsoft.com](https://cla.microsoft.com).

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
