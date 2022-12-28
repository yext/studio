import { HexColor } from "@yext/studio";
import siteSettings from "./siteSettings";

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
  title: siteSettings.apiKey,
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
