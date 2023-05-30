import { HexColor } from "@yext/studio";

export interface NestedProp {
  nestedString?: string;
  nestedBool?: boolean;
  nestedObj?: {
    nestedNum?: number;
    nestedColor?: HexColor;
  };
}
