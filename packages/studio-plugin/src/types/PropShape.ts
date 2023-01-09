import { PropValueType } from "./PropValues";

export type PropShape = Omit<
  {
    [propName: string]: PropMetadata;
  },
  SpecialReactProps
> & {
  [propName in SpecialReactProps]?: never;
};

export enum SpecialReactProps {
  Children = "children",
}

export type PropMetadata =
  | {
      type: Exclude<PropValueType, PropValueType.Object>;
      doc?: string;
    }
  | {
      type: PropValueType.Object;
      doc?: undefined;
      shape: PropShape;
    };
