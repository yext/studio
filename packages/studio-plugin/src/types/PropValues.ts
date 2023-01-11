export type PropValues = {
  [propName: string]: PropVal;
};

export type PropVal = LiteralProp | ExpressionProp | ObjectProp;

export type LiteralProp = {
  kind: PropValueKind.Literal;
} & (NumberProp | StringProp | BooleanProp | HexColorProp);

export type ExpressionProp = {
  kind: PropValueKind.Expression;
  valueType: Exclude<PropValueType, PropValueType.Object>;
  value: string;
};

export enum PropValueType {
  number = "number",
  string = "string",
  boolean = "boolean",
  ReactNode = "ReactNode",
  Object = "Object",
  HexColor = "HexColor",
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
export type ObjectProp = {
  kind: PropValueKind.Literal;
  valueType: PropValueType.Object;
  value: PropValues;
};
// Used in component outside Studio to represent a hex color prop in Studio preview.
export type HexColor = `#${string}`;
export type HexColorProp = {
  valueType: PropValueType.HexColor;
  value: HexColor;
};
