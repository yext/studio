import { SyntaxKind } from "ts-morph";
import { PropValueType } from "../../lib";
import InterfaceParsingHelper, {
  ParsedInterfaceKind,
} from "../../src/parsers/helpers/InterfaceParsingHelper";
import createTestSourceFile from "../__utils__/createTestSourceFile";

it("can parse a string union type", () => {
  const { sourceFile } = createTestSourceFile(
    `export interface MyProps {
      fruit: 'apple' | 'pear',
  }`
  );
  const interfaceDeclaration = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.InterfaceDeclaration
  );
  const parsedInterface =
    InterfaceParsingHelper.parseInterfaceDeclaration(interfaceDeclaration);
  expect(parsedInterface).toEqual({
    fruit: {
      kind: ParsedInterfaceKind.Simple,
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
    InterfaceParsingHelper.parseInterfaceDeclaration(interfaceDeclaration)
  ).toThrowError(
    'Union types only support strings. Found a NumericLiteral within "fruit".'
  );
});
