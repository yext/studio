export interface MissingImportBannerProps {
  bgColor: HexColor;
}

export default function MissingImportBanner(props: MissingImportBannerProps) {
  return <div style={{ backgroundColor: props.bgColor }}></div>;
}
