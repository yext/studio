import { SyntaxKind } from "ts-morph";
import ShapeParsingHelper, {
  ParsedShapeKind,
} from "../../src/parsers/helpers/ShapeParsingHelper";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import { PropValueType } from "../../src/types";

it("can parse a string union type", () => {
  const { sourceFile } = createTestSourceFile(
    `export interface MyProps {
      fruit: 'apple' | 'pear',
  }`
  );
  const interfaceDeclaration = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.InterfaceDeclaration
  );
  const parsedShape = ShapeParsingHelper.parseShape(interfaceDeclaration);
  expect(parsedShape).toEqual({
    fruit: {
      kind: ParsedShapeKind.Simple,
      type: PropValueType.string,
      unionValues: ["apple", "pear"],
      required: true,
    },
  });
});

it("errors for unions of non strings", () => {
  const { sourceFile } = createTestSourceFile(
    `export interface MyProps {
      fruit: 1 | 2,
  }`
  );
  const interfaceDeclaration = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.InterfaceDeclaration
  );
  expect(() =>
    ShapeParsingHelper.parseShape(interfaceDeclaration)
  ).toThrowError(
    'Union types only support strings. Found a NumericLiteral within "fruit".'
  );
});

it("can parse a type literal", () => {
  const { sourceFile } = createTestSourceFile(
    `export type MyProps = {
      fruit: string
  }`
  );
  const typeLiteral = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.TypeLiteral
  );
  const parsedShape = ShapeParsingHelper.parseShape(typeLiteral);
  expect(parsedShape).toEqual({
    fruit: {
      kind: ParsedShapeKind.Simple,
      type: "string",
      required: true,
    },
  });
});
