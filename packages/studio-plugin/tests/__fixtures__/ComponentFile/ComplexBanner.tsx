import { HexColor } from "@yext/studio";
import { INITIAL_TITLE } from "some-constants-file.ts"

export interface ComplexBannerProps {
  /** jsdoc */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor: HexColor;
}

export const initialProps: ComplexBannerProps = {
  bgColor: "#abcdef",
  num: 5,
  bool: false,
  title: INITIAL_TITLE
};

export default function ComplexBanner(props: ComplexBannerProps) {
  return (
    <div style={{ backgroundColor: props.bgColor }}>
      {props.title}
      {props.bool}
    </div>
  );
}
