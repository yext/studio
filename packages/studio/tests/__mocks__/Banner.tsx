import { HexColor } from "@yext/studio";
import { useMemo } from "react";
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
  const style = useMemo(
    () => ({ backgroundColor: props.bgColor }),
    [props.bgColor]
  );

  return (
    <div style={style}>
      {props.title}
      {`${props.bool}`}
      {props.num}
    </div>
  );
}
