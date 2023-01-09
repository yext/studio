import { HexColor } from "@yext/studio";

export interface BannerProps {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
}

export const initialProps: BannerProps = {
  bgColor: "#abcdef",
  num: 5,
  bool: true,
  title: "initial title",
};

export default function Banner(props: BannerProps) {
  return (
    <div style={{ backgroundColor: props.bgColor }}>
      {props.title}
      {`${props.bool}`}
      {props.num}
    </div>
  );
}
