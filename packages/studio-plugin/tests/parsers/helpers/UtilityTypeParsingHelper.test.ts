import { SyntaxKind, TypeNode } from "ts-morph";
import createTestSourceFile from "../../__utils__/createTestSourceFile";
import UtilityTypeParsingHelper from "../../../src/parsers/helpers/UtilityTypeParsingHelper";
import {
  ParsedProperty,
  ParsedType,
  ParsedTypeKind,
} from "../../../src/parsers/helpers/TypeNodeParsingHelper";
import cloneDeep from "lodash/cloneDeep";

const nameProp: ParsedProperty = {
  kind: ParsedTypeKind.Simple,
  required: false,
  type: "string",
};

const numProp: ParsedProperty = {
  kind: ParsedTypeKind.Simple,
  required: true,
  type: "number",
};

const arrProp: ParsedProperty = {
  kind: ParsedTypeKind.Array,
  required: true,
  type: {
    kind: ParsedTypeKind.Simple,
    type: "boolean",
  },
};

const fullObjectType: ParsedType = {
  kind: ParsedTypeKind.Object,
  type: {
    name: nameProp,
    num: numProp,
    arr: arrProp,
  },
};

function mockedParseTypeNodeCreator(
  omitType: ParsedType,
  fullType = cloneDeep(fullObjectType)
): (node: TypeNode) => ParsedType {
  return (node: TypeNode) =>
    node.isKind(SyntaxKind.TypeLiteral) ? fullType : omitType;
}

describe("omit", () => {
  it("can handle a single omitted type", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyOmit = Omit<{ name?: string, num: number, arr: boolean[] }, "num">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );
    const parsedType = UtilityTypeParsingHelper.parseUtilityType(
      typeRef,
      mockedParseTypeNodeCreator({
        kind: ParsedTypeKind.StringLiteral,
        type: "num",
      })
    );
    expect(parsedType?.type).toEqual({
      name: nameProp,
      arr: arrProp,
    });
  });

  it("can handle multiple omitted types", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyOmit = Omit<{ name?: string, num: number, arr: boolean[] }, "name" | "num">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );
    const parsedType = UtilityTypeParsingHelper.parseUtilityType(
      typeRef,
      mockedParseTypeNodeCreator({
        kind: ParsedTypeKind.Simple,
        type: "string",
        unionValues: ["name", "num"],
      })
    );
    expect(parsedType?.type).toEqual({ arr: arrProp });
  });

  it("can handle non-overlapping omitted type", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyOmit = Omit<{ name?: string, num: number, arr: boolean[] }, "boo">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );
    const parsedType = UtilityTypeParsingHelper.parseUtilityType(
      typeRef,
      mockedParseTypeNodeCreator({
        kind: ParsedTypeKind.StringLiteral,
        type: "boo",
      })
    );
    expect(parsedType?.type).toEqual({
      name: nameProp,
      num: numProp,
      arr: arrProp,
    });
  });

  it("does not change non-object types", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyOmit = Omit<"test", "test">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );
    const testParsedType: ParsedType = {
      kind: ParsedTypeKind.StringLiteral,
      type: "test",
    };

    const parsedType = UtilityTypeParsingHelper.parseUtilityType(
      typeRef,
      mockedParseTypeNodeCreator(testParsedType, testParsedType)
    );
    expect(parsedType).toEqual(testParsedType);
  });

  it("throws an error if there an incorrect number of type arguments", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyOmit = Omit<{ name?: string, num: number, arr: boolean[] }, "name", "num">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );

    expect(() =>
      UtilityTypeParsingHelper.parseUtilityType(
        typeRef,
        mockedParseTypeNodeCreator({
          kind: ParsedTypeKind.StringLiteral,
          type: "name",
        })
      )
    ).toThrowError("Two type params expected for Omit utility type. Found 3.");
  });

  it("throws an error if the omit type is not a string literal or union of string literals", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyOmit = Omit<{ name?: string, num: number, arr: boolean[] }, { num: number }>;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );

    const omitType: ParsedType = {
      kind: ParsedTypeKind.Object,
      type: {
        num: {
          kind: ParsedTypeKind.Simple,
          required: true,
          type: "number",
        },
      },
    };

    expect(() =>
      UtilityTypeParsingHelper.parseUtilityType(
        typeRef,
        mockedParseTypeNodeCreator(omitType)
      )
    ).toThrowError(
      `Expected string literal or union of string literals for second type arg of Omit utility type. Found ${omitType}.`
    );
  });
});
