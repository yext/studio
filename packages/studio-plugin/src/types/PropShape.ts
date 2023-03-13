import { PropValueType } from "./PropValues";

export type PropShape<T extends PropValueType = PropValueType> = Omit<
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

export type PropMetadata<T extends PropValueType = PropValueType> = (
  | NestedPropMetadata<T>
  | NonUnionMetadata<T>
  | StringUnionMetadata
  | (PropValueType.Record extends T ? RecordMetadata : never)
) & {
  required?: boolean;
};

type NonUnionMetadata<T> = {
  type: Exclude<
    T,
    PropValueType.Object | PropValueType.string | PropValueType.Record
  >;
  doc?: string;
  unionValues?: never;
};

export type RecordMetadata = {
  type: PropValueType.Record;
  doc?: string;
  // Only Record<string, any> is supported.
  keyType: "string";
  valueType: "any";
  unionValues?: never;
};

type StringUnionMetadata = {
  type: PropValueType.string;
  doc?: string;
  unionValues?: string[];
};

export type NestedPropMetadata<T extends PropValueType = PropValueType> = {
  type: PropValueType.Object;
  doc?: undefined;
  shape: PropShape<T>;
};
