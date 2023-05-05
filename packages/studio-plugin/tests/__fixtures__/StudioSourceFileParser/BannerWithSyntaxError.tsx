export interface Props {
  title?: string;
}

export default function SimpleBanner(props: Props) {
  return <div>{props.title}<div>;
}
