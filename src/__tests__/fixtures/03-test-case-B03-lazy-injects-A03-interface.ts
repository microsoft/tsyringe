import {inject, injectable, registry} from "../../decorators";
import {A03, Ia03} from "./03-test-case-A03-lazy-injects-B03-interface";
import {delay} from "../../lazy-helpers";

export interface Ib03 {
  name: string;
}

@injectable()
@registry([
  {
    token: "Ia03",
    useToken: delay(() => A03)
  }
])
export class B03 implements Ib03 {
  public name = "B03";
  constructor(@inject("Ia03") public a: Ia03) {}
}
