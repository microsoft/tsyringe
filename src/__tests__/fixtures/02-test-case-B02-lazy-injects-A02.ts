import {A02} from "./02-test-case-A02-lazy-injects-B02";
import {injectable, inject} from "../../decorators";
import {delay} from "../../lazy-helpers";

@injectable()
export class B02 {
  public name = "B02";
  constructor(@inject(delay(() => A02)) public a: A02) {}
}
