import { HexColor } from "@yext/studio";

export interface BannerProps {
  /** banner's title */
  title?: string;
  num?: number;
  bool?: boolean;
  bgColor?: HexColor;
  obj?: {
    nestedString?: string;
    nestedBool?: boolean;
    nestedLitArr?: boolean[];
    nestedObj?: {
      nestedNum?: number;
      nestedColor?: HexColor;
      nestedExpArr?: string[];
    };
  };
}

export const initialProps: BannerProps = {
  bgColor: "#abcdef",
  num: 5,
  bool: true,
  title: "initial title",
  obj: {
    nestedLitArr: [true, false],
  },
};

export default function Banner(props: BannerProps) {
  const nestedString = props.obj?.nestedString;

  return (
    <div
      style={{ backgroundColor: props.bgColor }}
      className="p-2 text-lg border-4 border-blue-600"
    >
      {props.title}
      {`${props.bool}`}
      {props.num}
      {nestedString && <h2>{nestedString}</h2>}
    </div>
  );
}
