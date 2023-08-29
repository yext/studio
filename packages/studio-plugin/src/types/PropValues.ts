export type PropValues = {
  [propName: string]: PropVal;
};

export type PropVal = LiteralProp | ExpressionProp;
export type TypelessPropVal =
  | {
      kind: PropValueKind.Literal;
      value:
        | string
        | number
        | boolean
        | Record<string, TypelessPropVal>
        | TypelessPropVal[];
    }
  | Omit<ExpressionProp, "valueType">;
export type LiteralProp<T = PropValues> = {
  kind: PropValueKind.Literal;
} & (
  | NumberProp
  | StringProp
  | BooleanProp
  | HexColorProp
  | ObjectProp<T>
  | ArrayProp
  | TailwindClassProp
);

export type ExpressionProp =
  | {
      kind: PropValueKind.Expression;
      valueType: Exclude<
        PropValueType,
        PropValueType.Object | PropValueType.TailwindClass
      >;
      value: string;
    }
  | RecordProp;

export enum PropValueType {
  number = "number",
  string = "string",
  boolean = "boolean",
  ReactNode = "ReactNode",
  Object = "Object",
  HexColor = "HexColor",
  Record = "Record",
  Array = "Array",
  TailwindClass = "TailwindClass",
}

export enum PropValueKind {
  Literal = "Literal",
  Expression = "Expression",
}

type NumberProp = {
  valueType: PropValueType.number;
  value: number;
};
type StringProp = {
  valueType: PropValueType.string;
  value: string;
};
type BooleanProp = {
  valueType: PropValueType.boolean;
  value: boolean;
};
export type ObjectProp<T = PropValues> = {
  kind: PropValueKind.Literal;
  valueType: PropValueType.Object;
  value: T;
};
export type ArrayProp = {
  kind: PropValueKind.Literal;
  valueType: PropValueType.Array;
  value: PropVal[];
};
export type RecordProp = {
  kind: PropValueKind.Expression;
  valueType: PropValueType.Record;
  // Records are only supported for entity data right now.
  value: "document";
};
// Used in component outside Studio to represent a hex color prop in Studio preview.
export type HexColor = `#${string}`;
type HexColorProp = {
  valueType: PropValueType.HexColor;
  value: HexColor;
};
// For tailwind classes from the user's custom theme.
export type TailwindClass = string;
type TailwindClassProp = {
  valueType: PropValueType.TailwindClass;
  value: TailwindClass;
};
