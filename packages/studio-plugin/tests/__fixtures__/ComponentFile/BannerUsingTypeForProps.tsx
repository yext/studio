export type TitleType = {
  title?: string;
};

export default function BannerUsingTypeForProps(props: TitleType) {
  return <div>{props.title}</div>;
}
