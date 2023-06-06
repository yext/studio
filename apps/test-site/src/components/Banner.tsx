import { HexColor } from "@yext/studio";

export interface BannerData {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  words?: string[];
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
      <p>{props.words?.join(", ")}</p>
    </div>
  );
}
