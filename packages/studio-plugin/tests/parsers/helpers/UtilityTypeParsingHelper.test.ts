import { SyntaxKind, TypeNode } from "ts-morph";
import createTestSourceFile from "../../__utils__/createTestSourceFile";
import UtilityTypeParsingHelper from "../../../src/parsers/helpers/UtilityTypeParsingHelper";
import {
  ParsedProperty,
  ParsedType,
  ParsedTypeKind,
} from "../../../src/parsers/helpers/TypeNodeParsingHelpers";
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
    expect(parsedType?.type).toEqual({ name: nameProp, arr: arrProp });
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
      `type MyOmit = Omit<{ name?: string, num: number, arr: boolean[] }, Array<string>>;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );

    const omitType: ParsedType = {
      kind: ParsedTypeKind.Array,
      type: {
        kind: ParsedTypeKind.Simple,
        type: "string",
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

describe("pick", () => {
  it("can handle a single picked type", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyPick = Pick<{ name?: string, num: number, arr: boolean[] }, "num">;
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
    expect(parsedType?.type).toEqual({ num: numProp });
  });

  it("can handle multiple picked types", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyPick = Pick<{ name?: string, num: number, arr: boolean[] }, "name" | "num">;
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
    expect(parsedType?.type).toEqual({ name: nameProp, num: numProp });
  });

  it("throws an error if there an incorrect number of type arguments", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyPick = Pick<{ name?: string, num: number, arr: boolean[] }, "name", "num">;
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
    ).toThrowError("Two type params expected for Pick utility type. Found 3.");
  });

  it("throws an error if original type is not an object type", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyPick = Pick<"test", "test">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );
    const testParsedType: ParsedType = {
      kind: ParsedTypeKind.StringLiteral,
      type: "test",
    };

    expect(() =>
      UtilityTypeParsingHelper.parseUtilityType(
        typeRef,
        mockedParseTypeNodeCreator(testParsedType, testParsedType)
      )
    ).toThrowError(
      `Only object types are supported for first type arg of Pick utility type. Found ${testParsedType}.`
    );
  });

  it("throws an error if the pick type is not a string literal or union of string literals", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyPick = Pick<{ name?: string, num: number, arr: boolean[] }, Array<string>>;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );

    const pickType: ParsedType = {
      kind: ParsedTypeKind.Array,
      type: {
        kind: ParsedTypeKind.Simple,
        type: "string",
      },
    };

    expect(() =>
      UtilityTypeParsingHelper.parseUtilityType(
        typeRef,
        mockedParseTypeNodeCreator(pickType)
      )
    ).toThrowError(
      `Expected string literal or union of string literals for second type arg of Pick utility type. Found ${pickType}.`
    );
  });

  it("throws an error if pick types include one not a key in original type", () => {
    const { sourceFile } = createTestSourceFile(
      `type MyPick = Pick<{ name?: string, num: number, arr: boolean[] }, "name" | "boo">;
      }`
    );
    const typeRef = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.TypeReference
    );

    expect(() =>
      UtilityTypeParsingHelper.parseUtilityType(
        typeRef,
        mockedParseTypeNodeCreator({
          kind: ParsedTypeKind.Simple,
          type: "string",
          unionValues: ["name", "boo"],
        })
      )
    ).toThrowError(
      `Cannot pick key boo that is not present in type ${fullObjectType.type}.`
    );
  });
});
