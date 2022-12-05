import { HexColor } from "@yext/studio";

export interface ComplexBannerProps {
  /** jsdoc */
  title?: string,
  num?: number,
  bool?: boolean,
  bgColor: HexColor
}

export const initialProps: ComplexBannerProps = {
  bgColor: '#abcdef'
}

export default function ComplexBanner(props: ComplexBannerProps) {
  return (
    <div style={{'backgroundColor': props.bgColor }}>
      {props.title}
      {props.bool}
    </div>
  );
}
