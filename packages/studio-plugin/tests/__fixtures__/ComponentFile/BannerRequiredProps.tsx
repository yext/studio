export interface BannerRequiredPropsProps {
  title: string;
}

export default function BannerRequiredProps(props: BannerRequiredPropsProps) {
  return <div>{props.title}</div>;
}
