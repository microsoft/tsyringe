import {A01} from "./01-test-case-A01-injects-B01";
import {injectable} from "../../decorators";

@injectable()
export class B01 {
  constructor(public a: A01) {}
}
