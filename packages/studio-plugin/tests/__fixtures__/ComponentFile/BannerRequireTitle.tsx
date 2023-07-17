export interface BannerRequireTitleProps {
  title: string;
}

export default function BannerRequireTitle(props: BannerRequireTitleProps) {
  return <div>{props.title}</div>;
}
