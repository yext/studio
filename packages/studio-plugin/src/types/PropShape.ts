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

export type PropMetadata = {
  type: PropValueType;
  doc?: string;
};
