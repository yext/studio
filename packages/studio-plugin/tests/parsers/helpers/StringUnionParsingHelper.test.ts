import { SyntaxKind } from "ts-morph";
import StringUnionParsingHelper from "../../../src/parsers/helpers/StringUnionParsingHelper";
import createTestSourceFile from "../../__utils__/createTestSourceFile";
import { ParsedTypeKind } from "../../../src/parsers/helpers/TypeNodeParsingHelper";

it("does not handle StringKeywords within unions", () => {
  const { sourceFile } = createTestSourceFile(
    `type MyUnion = 'onion' | string`
  );
  const union = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.UnionType
  );
  const parse = () =>
    StringUnionParsingHelper.parseStringUnion(union, "MyUnion", () => {
      throw new Error("Should not be called");
    });
  expect(parse).toThrow(/^Unexpected node kind StringKeyword/);
});

it("does not handle type references to StringKeywords", () => {
  const { sourceFile } = createTestSourceFile(
    `type StringSynonym = string; type MyUnion = 'onion' | StringSynonym`
  );
  const union = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.UnionType
  );
  const parse = () =>
    StringUnionParsingHelper.parseStringUnion(union, "MyUnion", () => ({
      kind: ParsedTypeKind.Simple,
      type: "string",
    }));
  expect(parse).toThrow('No union values found when parsing "StringSynonym"');
});
