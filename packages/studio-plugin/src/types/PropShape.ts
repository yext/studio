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
  Key = "key",
}

export type PropMetadata<T extends PropValueType = PropValueType> =
  PropType<T> & {
    doc?: string;
    required: boolean;
  };

export type PropType<T extends PropValueType = PropValueType> =
  | NestedPropMetadata<T>
  | NonUnionMetadata<T>
  | StringUnionMetadata
  | (PropValueType.Record extends T ? RecordMetadata : never)
  | ArrayMetadata;

type NonUnionMetadata<T> = {
  type: Exclude<
    T,
    | PropValueType.Object
    | PropValueType.string
    | PropValueType.Record
    | PropValueType.Array
  >;
  unionValues?: never;
};

export type RecordMetadata = {
  type: PropValueType.Record;
  // Only Record<string, any> is supported.
  recordKey: "string";
  recordValue: "any";
  unionValues?: never;
};

type StringUnionMetadata = {
  type: PropValueType.string;
  unionValues?: string[];
};

export type NestedPropMetadata<T extends PropValueType = PropValueType> = {
  type: PropValueType.Object;
  shape: PropShape<T>;
};

export type ArrayMetadata = {
  type: PropValueType.Array;
  itemType: PropType;
  unionValues?: never;
};
