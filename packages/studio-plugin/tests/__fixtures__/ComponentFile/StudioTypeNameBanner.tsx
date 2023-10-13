import { MyString as HexColor } from "../StudioSourceFileParser/exportedTypes";

export interface StudioTypeNameBannerProps {
  bgColor: HexColor;
}

export default function StudioTypeNameBanner(props: StudioTypeNameBannerProps) {
  return <div style={{ backgroundColor: props.bgColor }}></div>;
}
