import {A02} from "./02-test-case-A02-lazy-injects-B02";
import {singleton, inject} from "../../decorators";
import {delay} from "../../lazy-helpers";

@singleton()
export class B02 {
  public name = "B02";
  public prop = {
    defined: false
  };
  constructor(@inject(delay(() => A02)) public a: A02) {}
}
