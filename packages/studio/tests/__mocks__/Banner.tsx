import { HexColor } from "@yext/studio";
import { useMemo } from "react";
import siteSettings from "./siteSettings";

export interface BannerProps {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  nestedProp?: {
    egg?: string;
  };
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
      <div>{props.title}</div>
      {`${props.bool}`}
      {props.num}
      {props?.nestedProp?.egg}
    </div>
  );
}
