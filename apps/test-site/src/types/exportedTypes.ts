import { HexColor as Color } from "@yext/studio";

export interface NestedProp {
  nestedString?: string;
  nestedBool?: boolean;
  nestedObj?: {
    nestedNum?: number;
    nestedColor?: Color;
  };
}
