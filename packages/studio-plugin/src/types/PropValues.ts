import { ParsedObjectLiteral } from '../parsers/helpers/StaticParsingHelpers';

export type PropValues = {
  [propName: string]: PropVal;
};

export type PropVal = LiteralProp | ExpressionProp;
export type TypelessPropVal = Omit<LiteralProp<ParsedObjectLiteral>, 'valueType'> | Omit<ExpressionProp, 'valueType'>;

export type LiteralProp<T = PropValues> = {
  kind: PropValueKind.Literal;
} & (NumberProp | StringProp | BooleanProp | HexColorProp | ObjectProp<T>);

export type ExpressionProp =
  | {
      kind: PropValueKind.Expression;
      valueType: Exclude<PropValueType, PropValueType.Object>;
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
}

export enum PropValueKind {
  Literal = "Literal",
  Expression = "Expression",
}

export type NumberProp = {
  valueType: PropValueType.number;
  value: number;
};
export type StringProp = {
  valueType: PropValueType.string;
  value: string;
};
export type BooleanProp = {
  valueType: PropValueType.boolean;
  value: boolean;
};
export type ObjectProp<T> = {
  kind: PropValueKind.Literal;
  valueType: PropValueType.Object;
  value: T;
};
export type RecordProp = {
  kind: PropValueKind.Expression;
  valueType: PropValueType.Record;
  // Records are only supported for entity data right now.
  value: "document";
};
// Used in component outside Studio to represent a hex color prop in Studio preview.
export type HexColor = `#${string}`;
export type HexColorProp = {
  valueType: PropValueType.HexColor;
  value: HexColor;
};
