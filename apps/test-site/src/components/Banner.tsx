import { HexColor } from "@yext/studio";

export interface BannerProps {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  nestedProp?: {
    egg?: string;
  };
}

export const initialProps: BannerProps = {
  bgColor: "#abcdef",
  num: 5,
  bool: true,
  title: "initial !!",
};

export default function Banner(props: BannerProps) {
  return (
    <div style={{ backgroundColor: props.bgColor }}>
      <p>{props.title}</p>
      <p>{`${props.bool}`}</p>
      <p>{props.num}</p>
      <h1>{props?.nestedProp?.egg}</h1>
    </div>
  );
}
