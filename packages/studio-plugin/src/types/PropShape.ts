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

export type PropMetadata = NestedPropMetadata | {
  type: Exclude<PropValueType, PropValueType.Object>;
  doc?: string;
};

export type NestedPropMetadata = {
  type: PropValueType.Object;
  doc?: undefined;
  shape: PropShape;
};
   
