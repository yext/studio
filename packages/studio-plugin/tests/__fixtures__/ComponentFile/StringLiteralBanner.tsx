export interface StringLiteralBannerProps {
  title?: "number";
}

export default function StringLiteralBanner(props: StringLiteralBannerProps) {
  return <div>{props.title}</div>;
}
