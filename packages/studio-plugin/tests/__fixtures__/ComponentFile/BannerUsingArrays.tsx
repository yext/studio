export interface BannerUsingArraysProps {
  arrProp?: string[];
  typeArr: Array<number>;
}

export default function BannerUsingArrays(props: BannerUsingArraysProps) {
  return (
    <div>
      {props.arrProp?.[0]}
      {props.typeArr[0]}
    </div>
  );
}
