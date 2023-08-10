import { HexColor } from "@yext/studio";
import { NestedProp } from "../types/exportedTypes";

export interface BannerData {
  /**
   * @tooltip Banner's title
   * @displayName Title
   */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  obj?: NestedProp;
  /**
   * @tooltip Start and End are required for each interval.
   * @displayName Intervals
   */
  intervals?: {
    end: string;
    start: string;
  }[];
  fixedText?: string;
}

export const initialProps: BannerData = {
  bgColor: "#abcdef",
  num: 5,
  bool: true,
  title: "initial title",
  fixedText: "This is fixed text",
};

export default function Banner(props: BannerData) {
  return (
    <div>
      <p style={{ backgroundColor: props.bgColor }}>{props.title}</p>
      <p>{`${props.bool}`}</p>
      <p>{props.num}</p>
      <h1>{props.obj && JSON.stringify(props.obj)}</h1>
      <p>
        {props.intervals?.map(
          (interval) => `Start: ${interval.start} End: ${interval.end}, `
        )}
      </p>
      <p>{props.fixedText}</p>
    </div>
  );
}
