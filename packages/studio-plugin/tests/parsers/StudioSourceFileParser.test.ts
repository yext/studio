import { SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import expectSyntaxKind from "../__utils__/expectSyntaxKind";
import { ParsedShapeKind } from "../../src/parsers/helpers/ShapeParsingHelper";

describe("parseExportedObjectLiteral", () => {
  it("throws when the variable is not an ObjectLiteralExpression", () => {
    const studioSourceFileParser = createParser(
      'export const a = "not an object";'
    );
    expect(() =>
      studioSourceFileParser.parseExportedObjectLiteral("a")
    ).toThrow(
      'Could not find ObjectLiteralExpression within `export const a = "not an object";`'
    );
  });
});

describe("getDefaultExport", () => {
  it("correctly gets direct function declaration", () => {
    const studioSourceFileParser = createParser(
      "export const no = false; export default function test() {}"
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.FunctionDeclaration);
    expect(defaultExport.getName()).toBe("test");
  });

  describe("export assignment", () => {
    it("correctly gets name of direct identifier", () => {
      const studioSourceFileParser = createParser(
        "const test = 1; const no = false; export default test;"
      );
      const defaultExport = studioSourceFileParser.getDefaultExport();
      expectSyntaxKind(defaultExport, SyntaxKind.Identifier);
      expect(defaultExport.getText()).toBe("test");
    });
  });

  it("correctly gets an ObjectLiteralExpression", () => {
    const studioSourceFileParser = createParser(
      "const test = 1; const no = false; export default { num: test };"
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });

  it("correctly gets an ObjectLiteralExpression wrapped in parenthesis", () => {
    const studioSourceFileParser = createParser(
      "const test = 1; const no = false; export default ({ num: test });"
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });

  it("correctly gets an ArrayLiteralExpression", () => {
    const studioSourceFileParser = createParser(
      "const test = 1; const no = false; export default [test];"
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ArrayLiteralExpression);
  });

  it("correctly gets an ObjectLiteralExpression with a type assertion", () => {
    const studioSourceFileParser = createParser(
      "export default { apiKey: '123' } as SiteSettings;"
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });
});

describe("parseShape", () => {
  it("can parse a component's prop shape defined with an interface", () => {
    const parser = createParser(
      `export default function MyComponent(props: MyProps) {};
      interface MyProps { myNum: number }`
    );
    expect(parser.parseShape("MyProps")).toEqual({
      myNum: {
        kind: ParsedShapeKind.Simple,
        type: "number",
        required: true,
      },
    });
  });

  it("can parse a component's prop shape defined with a type", () => {
    const parser = createParser(
      `export default function MyComponent(props: MyProps) {};
      type MyProps = { myBool: boolean }`
    );
    expect(parser.parseShape("MyProps")).toEqual({
      myBool: {
        kind: ParsedShapeKind.Simple,
        type: "boolean",
        required: true,
      },
    });
  });
});

function createParser(sourceCode: string) {
  const { project } = createTestSourceFile(sourceCode);
  return new StudioSourceFileParser("test.tsx", project);
}
