import { HexColor } from "@yext/studio";
import './index.css';

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
  title: 'initial title',
};

export default function ComplexBanner(props: ComplexBannerProps) {
  return (
    <div style={{ backgroundColor: props.bgColor }}>
      {props.title}
      {props.bool}
    </div>
  );
}
