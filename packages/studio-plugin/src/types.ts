
export enum FileMetadataKind {
  Component = 'componentMetadata',
}

export type ComponentMetadata = {
  kind: FileMetadataKind.Component,
  initialProps?: PropValues,
  propShape?: PropShape,
  acceptsChildren?: boolean
}

export type PropShape = Omit<{
  [propName: string]: PropMetadata
}, SpecialReactProps> & {
    [propName in SpecialReactProps]?: never
  }

export enum SpecialReactProps {
  Children = 'children'
}

export type PropMetadata = {
  type: PropValueType,
  doc?: string
}

export enum PropValueKind {
  Literal = 'literal',
  Expression = 'expression'
}

export enum PropValueType {
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  ReactNode = 'ReactNode',
  HexColor = 'HexColor',
}

export type PropValues = {
  [propName: string]: PropVal
}
export type PropVal = LiteralProp | ExpressionProp

export type LiteralProp = {
  kind: PropValueKind.Literal
} & (NumberProp | StringProp | BooleanProp | HexColorProp)

export type NumberProp = {
  valueType: PropValueType.number,
  value: number
}
export type StringProp = {
  valueType: PropValueType.string,
  value: string
}
export type BooleanProp = {
  valueType: PropValueType.boolean,
  value: boolean
}
export type HexColorProp = {
  valueType: PropValueType.HexColor,
  value: string
}
export type ExpressionProp = {
  kind: PropValueKind.Expression,
  valueType: PropValueType,
  value: string
}
