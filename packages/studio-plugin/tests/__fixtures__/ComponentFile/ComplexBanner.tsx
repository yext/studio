import { HexColor } from "@yext/studio";
import { CtaData } from "@yext/search-ui-react";
import "./index.css";

export interface ComplexBannerProps {
  /** jsdoc */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  cta?: CtaData;
  /** array doc */
  colorArr?: HexColor[];
}

export const initialProps: ComplexBannerProps = {
  bgColor: "#abcdef",
  num: 5,
  bool: false,
  title: "initial title",
  cta: {
    label: "LABEL",
    link: "LINK",
    linkType: "LINKTYPE",
  },
  colorArr: ["#abcdef", "#ffffff"],
};

export default function ComplexBanner(props: ComplexBannerProps) {
  return (
    <div style={{ backgroundColor: props.bgColor }}>
      {props.title}
      {props.bool}
      {props.cta?.label}
      {props.colorArr?.[0]}
    </div>
  );
}
