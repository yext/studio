import { PropValueType } from "./PropValues";

export type PropShape<T = PropValueType> = Omit<
  {
    [propName: string]: PropMetadata<T>;
  },
  SpecialReactProps
> & {
  [propName in SpecialReactProps]?: never;
};

export enum SpecialReactProps {
  Children = "children",
}

export type PropMetadata<T = PropValueType> =
  | NestedPropMetadata<T>
  | {
      type: Exclude<T, PropValueType.Object | PropValueType.string>;
      doc?: string;
      unionValues?: never;
    }
  | {
      type: PropValueType.string;
      doc?: string;
      unionValues?: string[];
    };

export type NestedPropMetadata<T = PropValueType> = {
  type: PropValueType.Object;
  doc?: undefined;
  shape: PropShape<T>;
};
