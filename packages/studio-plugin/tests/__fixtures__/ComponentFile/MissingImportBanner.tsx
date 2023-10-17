export interface MissingImportBannerProps {
  bgColor: Color;
}

export default function MissingImportBanner(props: MissingImportBannerProps) {
  return <div style={{ backgroundColor: props.bgColor }}></div>;
}
