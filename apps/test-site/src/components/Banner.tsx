import { HexColor } from "@yext/studio";
import { NestedProp } from "../types/exportedTypes";

export interface BannerData {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  obj?: NestedProp;
  intervals?: {
    end: string,
    start: string,
  }[];
}

export const initialProps: BannerData = {
  bgColor: "#abcdef",
  num: 5,
  bool: true,
  title: "initial title",
};

export default function Banner(props: BannerData) {
  return (
    <div>
      <p style={{ backgroundColor: props.bgColor }}>{props.title}</p>
      <p>{`${props.bool}`}</p>
      <p>{props.num}</p>
      <h1>{props.obj && JSON.stringify(props.obj)}</h1>
      <p>{props.intervals?.map(interval => `Start: ${interval.start} End: ${interval.end}, `)}</p>
    </div>
  );
}
