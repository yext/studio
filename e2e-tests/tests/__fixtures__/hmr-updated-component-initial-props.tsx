import { HexColor } from "@yext/studio";

export interface BannerProps {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
}

export const initialProps: BannerProps = {
  num: 1,
  bool: false,
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
