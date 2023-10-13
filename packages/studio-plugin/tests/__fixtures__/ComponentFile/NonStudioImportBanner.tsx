import { HexColor } from "@yext/studio-plugin";

export interface NonStudioImportBannerProps {
  bgColor: HexColor;
}

export default function NonStudioImportBanner(
  props: NonStudioImportBannerProps
) {
  return <div style={{ backgroundColor: props.bgColor }}></div>;
}
