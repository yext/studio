export interface BannerProps {
  bannerText?: string;
}

export default function BannerComponent(props: BannerProps) {
  return <div>{props.bannerText}</div>;
}
