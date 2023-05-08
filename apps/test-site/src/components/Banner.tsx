import { HexColor } from "@yext/studio";
import { NestedProp } from "../types/exportedTypes";

export type BannerData = string;

export const initialProps: BannerData = {
  bgColor: "#abcdef",
  num: 5,
  bool: true,
  title: "initial title",
};

export default function Banner(props: BannerData) {
  return (
    <div style={{ backgroundColor: props.bgColor }}>
      <p>{props.title}</p>
      <p>{`${props.bool}`}</p>
      <p>{props.num}</p>
      <h1>{props?.nestedProp?.egg}</h1>
    </div>
  );
}
