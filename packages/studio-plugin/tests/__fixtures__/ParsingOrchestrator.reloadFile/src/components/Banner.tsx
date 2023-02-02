export interface BannerProps {
  bannerText?: string;
}

export default function Banner(props: BannerProps) {
  return <div>{props.bannerText}</div>;
}
