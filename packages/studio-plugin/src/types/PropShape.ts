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
    tooltip?: string;
    displayName?: string;
    required: boolean;
  };

export type PropType<T extends PropValueType = PropValueType> =
  | ObjectPropType<T>
  | NonUnionPropType<T>
  | StringUnionPropType
  | (PropValueType.Record extends T ? RecordPropType : never)
  | (PropValueType.Array extends T ? ArrayPropType : never);

type NonUnionPropType<T> = {
  type: Exclude<
    T,
    | PropValueType.Object
    | PropValueType.string
    | PropValueType.Record
    | PropValueType.Array
  >;
  unionValues?: never;
};

export type RecordPropType = {
  type: PropValueType.Record;
  // Only Record<string, any> is supported.
  recordKey: "string";
  recordValue: "any";
  unionValues?: never;
};

type StringUnionPropType = {
  type: PropValueType.string;
  unionValues?: string[];
};

export type ObjectPropType<T extends PropValueType = PropValueType> = {
  type: PropValueType.Object;
  shape: PropShape<T>;
  unionValues?: never;
};

export type ArrayPropType = {
  type: PropValueType.Array;
  itemType: PropType;
  unionValues?: never;
};
