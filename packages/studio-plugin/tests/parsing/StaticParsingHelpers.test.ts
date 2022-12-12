import { SyntaxKind } from "ts-morph";
import { PropShape, PropValueType } from "../../lib";
import StaticParsingHelpers from "../../src/parsing/StaticParsingHelpers";
import createTestSourceFile from "../__utils__/createTestSourceFile";

describe("parseObjectLiteral", () => {
  it("parsing an object literal with an expression", () => {
    const { sourceFile } = createTestSourceFile(
      `const a = { aKey: another.expression }`
    );
    const objectLiteralExpression = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ObjectLiteralExpression
    );
    const parsedValue = StaticParsingHelpers.parseObjectLiteral(
      objectLiteralExpression
    );
    expect(parsedValue).toEqual({
      aKey: {
        value: "another.expression",
        isExpression: true,
      },
    });
  });

  it("Throws an Error when an unrecognized Expression is encountered", () => {
    const { sourceFile } = createTestSourceFile(
      `const a = { aKey: callFunction() }`
    );
    const objectLiteralExpression = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ObjectLiteralExpression
    );
    expect(() =>
      StaticParsingHelpers.parseObjectLiteral(objectLiteralExpression)
    ).toThrowError(/^Unrecognized prop value .* CallExpression$/);
  });

  it("Throws an Error if the spread operator is used", () => {
    const { sourceFile } = createTestSourceFile(
      `const a = { ...dontSpreadMe }`
    );
    const objectLiteralExpression = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ObjectLiteralExpression
    );
    expect(() =>
      StaticParsingHelpers.parseObjectLiteral(objectLiteralExpression)
    ).toThrowError(/^Unrecognized node type: SpreadAssignment/);
  });
});

describe("parseJsxAttributes", () => {
  const propShape: PropShape = {
    title: { type: PropValueType.string, doc: "jsdoc" },
  };

  it("throws an error if a prop type isn't found", () => {
    const { sourceFile } = createTestSourceFile(
      `function Test() { return <Banner num={1} />; }`
    );
    const jsxAttributes = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.JsxSelfClosingElement
    ).getAttributes();
    expect(() =>
      StaticParsingHelpers.parseJsxAttributes(jsxAttributes, propShape)
    ).toThrowError(/^Could not find prop type for:/);
  });

  it("throws an error if a prop value is invalid", () => {
    const { sourceFile } = createTestSourceFile(
      `function Test() { return <Banner title={1} />; }`
    );
    const jsxAttributes = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.JsxSelfClosingElement
    ).getAttributes();
    expect(() =>
      StaticParsingHelpers.parseJsxAttributes(jsxAttributes, propShape)
    ).toThrowError(/^Invalid prop value:/);
  });
});
