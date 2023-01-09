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
      <p>{props.title}</p>
      <p>{`${props.bool}`}</p>
      <p>{props.num}</p>
    </div>
  );
}
