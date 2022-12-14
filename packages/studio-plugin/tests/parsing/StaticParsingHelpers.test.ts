import { SyntaxKind } from "ts-morph";
import { PropShape, PropValueType } from "../../lib";
import StaticParsingHelpers from "../../src/parsing/StaticParsingHelpers";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import expectSyntaxKind from "../__utils__/expectSyntaxKind";

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
    const jsxAttributes = sourceFile
      .getFirstDescendantByKindOrThrow(SyntaxKind.JsxSelfClosingElement)
      .getAttributes();
    expect(() =>
      StaticParsingHelpers.parseJsxAttributes(jsxAttributes, propShape)
    ).toThrowError(/^Could not find prop type for:/);
  });

  it("throws an error if a prop value is invalid", () => {
    const { sourceFile } = createTestSourceFile(
      `function Test() { return <Banner title={1} />; }`
    );
    const jsxAttributes = sourceFile
      .getFirstDescendantByKindOrThrow(SyntaxKind.JsxSelfClosingElement)
      .getAttributes();
    expect(() =>
      StaticParsingHelpers.parseJsxAttributes(jsxAttributes, propShape)
    ).toThrowError(/^Invalid prop value:/);
  });
});

describe("unwrapParensExpression", () => {
  it("recursively unwraps the expression", () => {
    const { sourceFile } = createTestSourceFile(
      `const a = ((({ innerKey: 'val' })))`
    );
    const parens = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ParenthesizedExpression
    );
    const unwrapped = StaticParsingHelpers.unwrapParensExpression(parens);
    expectSyntaxKind(unwrapped, SyntaxKind.ParenthesizedExpression);
    expect(unwrapped.getFullText()).toEqual("({ innerKey: 'val' })");
  });
});

describe("parseExportAssignment", () => {
  it("can parse an ObjectLiteralExpression wrapped in parens", () => {
    const { sourceFile } = createTestSourceFile(
      `export default ({ innerKey: 'val' })`
    );
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    const objectLiteral =
      StaticParsingHelpers.parseExportAssignment(exportAssignment);
    expectSyntaxKind(objectLiteral, SyntaxKind.ObjectLiteralExpression);
    expect(objectLiteral.getFullText()).toEqual("{ innerKey: 'val' }");
  });

  it("can parse an ObjectLiteralExpression", () => {
    const { sourceFile } = createTestSourceFile(
      `export default { innerKey: 'val' }`
    );
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    const objectLiteral =
      StaticParsingHelpers.parseExportAssignment(exportAssignment);
    expectSyntaxKind(objectLiteral, SyntaxKind.ObjectLiteralExpression);
    expect(objectLiteral.getFullText()).toEqual(" { innerKey: 'val' }");
  });

  it("can parse an ArrayLiteralExpression", () => {
    const { sourceFile } = createTestSourceFile(`export default [1, 2, 3]`);
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    const parsed = StaticParsingHelpers.parseExportAssignment(exportAssignment);
    expectSyntaxKind(parsed, SyntaxKind.ArrayLiteralExpression);
    expect(parsed.getFullText()).toEqual(" [1, 2, 3]");
  });

  it("can parse an Identifier", () => {
    const { sourceFile } = createTestSourceFile(
      `const bob = 1; export default bob;`
    );
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    const parsed = StaticParsingHelpers.parseExportAssignment(exportAssignment);
    expectSyntaxKind(parsed, SyntaxKind.Identifier);
    expect(parsed.getFullText()).toEqual(" bob");
  });

  it("can parse an AsExpression (type assertion)", () => {
    const { sourceFile } = createTestSourceFile(
      `export default { innerKey: 'val' } as SiteSettings`
    );
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    const objectLiteral =
      StaticParsingHelpers.parseExportAssignment(exportAssignment);
    expectSyntaxKind(objectLiteral, SyntaxKind.ObjectLiteralExpression);
    expect(objectLiteral.getFullText()).toEqual(" { innerKey: 'val' }");
  });

  it("errors if trying to parse an AsExpression wrapped in parenthesis", () => {
    const { sourceFile } = createTestSourceFile(
      `export default ({ innerKey: 'val' } as SiteSettings)`
    );
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    expect(() =>
      StaticParsingHelpers.parseExportAssignment(exportAssignment)
    ).toThrowError(/^Could not find a child of kind/);
  });

  it("will error if parsing JSX", () => {
    const { sourceFile } = createTestSourceFile(
      `export default <MyComponent/>;`
    );
    const exportAssignment = sourceFile.getFirstDescendantByKindOrThrow(
      SyntaxKind.ExportAssignment
    );
    expect(() =>
      StaticParsingHelpers.parseExportAssignment(exportAssignment)
    ).toThrowError(/^Could not find a child of kind/);
  });
});
