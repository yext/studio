import { JsxAttributeLike, SyntaxKind } from "ts-morph";
import { PropShape } from "../../src/types/PropShape";
import {
  PropValueKind,
  PropValueType,
  PropValues,
} from "../../src/types/PropValues";
import StaticParsingHelpers from "../../src/parsers/helpers/StaticParsingHelpers";
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
        kind: PropValueKind.Expression,
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
    title: { type: PropValueType.string, tooltip: "jsdoc", required: false },
    number: { type: PropValueType.number, required: false },
    nested: {
      type: PropValueType.Object,
      required: false,
      shape: {
        expr: {
          type: PropValueType.string,
          required: false,
        },
        str: {
          type: PropValueType.string,
          required: false,
        },
      },
    },
    arr: {
      type: PropValueType.Array,
      required: false,
      itemType: {
        type: PropValueType.string,
      },
    },
  };

  it("skips special React props", () => {
    const sourceCode = `function Test() { return <Banner title="Name" key={1} />; }`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    const receivedPropValues = StaticParsingHelpers.parseJsxAttributes(
      jsxAttributes,
      propShape
    );
    const expectedPropValues = {
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "Name",
      },
    };
    expect(receivedPropValues).toEqual(expectedPropValues);
  });

  it("throws an error if a prop type isn't found", () => {
    const sourceCode = `function Test() { return <Banner num={1} />; }`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    expect(() =>
      StaticParsingHelpers.parseJsxAttributes(jsxAttributes, propShape)
    ).toThrowError(/^Could not find prop metadata for:/);
  });

  it("throws an error if a prop value is invalid", () => {
    const sourceCode = `function Test() { return <Banner title={1} />; }`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    expect(() =>
      StaticParsingHelpers.parseJsxAttributes(jsxAttributes, propShape)
    ).toThrowError(/^Invalid prop value:/);
  });

  it("can parse nested objects with expressions and string literals", () => {
    const sourceCode = `<Banner nested={{ expr: document.name, str: 'cheese' }}  />`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    const receivedPropValues = StaticParsingHelpers.parseJsxAttributes(
      jsxAttributes,
      propShape
    );
    const expectedPropValues: PropValues = {
      nested: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          expr: {
            kind: PropValueKind.Expression,
            value: "document.name",
            valueType: PropValueType.string,
          },
          str: {
            kind: PropValueKind.Literal,
            value: "cheese",
            valueType: PropValueType.string,
          },
        },
      },
    };
    expect(receivedPropValues).toEqual(expectedPropValues);
  });

  it("can parse arrays with expressions and string literals", () => {
    const sourceCode = `<Banner arr={[ document.name, 'cheese' ]} />`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    const receivedPropValues = StaticParsingHelpers.parseJsxAttributes(
      jsxAttributes,
      propShape
    );
    const expectedPropValues: PropValues = {
      arr: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Array,
        value: [
          {
            kind: PropValueKind.Expression,
            value: "document.name",
            valueType: PropValueType.string,
          },
          {
            kind: PropValueKind.Literal,
            value: "cheese",
            valueType: PropValueType.string,
          },
        ],
      },
    };
    expect(receivedPropValues).toEqual(expectedPropValues);
  });

  it("parses the undefined keyword", () => {
    const sourceCode = `<Banner title={undefined} />`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    const receivedPropValues = StaticParsingHelpers.parseJsxAttributes(
      jsxAttributes,
      propShape
    );
    const expectedPropValues: PropValues = {};
    expect(receivedPropValues).toEqual(expectedPropValues);
  });

  it("parses the undefined keyword in nested attributes", () => {
    const sourceCode = `<Banner nested={{ expr: document.name, str: undefined }} />`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    const receivedPropValues = StaticParsingHelpers.parseJsxAttributes(
      jsxAttributes,
      propShape
    );
    const expectedPropValues: PropValues = {
      nested: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          expr: {
            kind: PropValueKind.Expression,
            value: "document.name",
            valueType: PropValueType.string,
          },
        },
      },
    };
    expect(receivedPropValues).toEqual(expectedPropValues);
  });

  it("can parse a negative numeric literal", () => {
    const sourceCode = `<Banner number={-1} />`;
    const jsxAttributes = getJsxAttributesFromSource(sourceCode);
    const receivedPropValues = StaticParsingHelpers.parseJsxAttributes(
      jsxAttributes,
      propShape
    );
    const expectedPropValues = {
      number: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: -1,
      },
    };
    expect(receivedPropValues).toEqual(expectedPropValues);
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

function getJsxAttributesFromSource(code: string): JsxAttributeLike[] {
  const { sourceFile } = createTestSourceFile(code);
  const jsxAttributes = sourceFile
    .getFirstDescendantByKindOrThrow(SyntaxKind.JsxSelfClosingElement)
    .getAttributes();
  return jsxAttributes;
}
