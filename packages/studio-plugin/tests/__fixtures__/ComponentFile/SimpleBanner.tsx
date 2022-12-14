export interface SimpleBannerProps {
  title?: string;
}

export default function SimpleBanner(props: SimpleBannerProps) {
  return <div>{props.title}</div>;
}
