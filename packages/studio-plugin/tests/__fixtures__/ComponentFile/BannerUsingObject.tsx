export interface BannerUsingObjectProps {
  objProp?: {
    title?: string;
    subtitle?: string;
    templateString?: string;
    expression?: string;
  };
}

export default function BannerUsingObject(props: BannerUsingObjectProps) {
  return <div>{props.objProp?.title}</div>;
}
