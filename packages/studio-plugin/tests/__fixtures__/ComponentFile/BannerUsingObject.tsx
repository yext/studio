export interface BannerUsingObjectProps {
  objProp?: {
    title?: string;
  };
}

export default function BannerUsingObject(props: BannerUsingObjectProps) {
  return <div>{props.objProp?.title}</div>;
}
