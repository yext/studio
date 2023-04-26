import { SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import expectSyntaxKind from "../__utils__/expectSyntaxKind";
import { ParsedShapeKind } from "../../src/parsers/helpers/ShapeParsingHelper";
import path from "path";

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

  it("can parse an interface imported from a file", () => {
    const parser = createParser(
      `import { SimpleBannerProps } from "../__fixtures__/ComponentFile/SimpleBanner";`
    );
    expect(parser.parseShape("SimpleBannerProps")).toEqual({
      title: {
        kind: ParsedShapeKind.Simple,
        type: "string",
        required: false,
      },
    });
  });

  it("can parse an interface imported from an external package", () => {
    const parser = createParser(
      `import { CtaData } from "@yext/search-ui-react";`
    );
    expect(parser.parseShape("CtaData")).toEqual({
      label: {
        doc: "The display label for the CTA element.",
        kind: ParsedShapeKind.Simple,
        required: true,
        type: "string",
      },
      link: {
        doc: "The CTA link source.",
        kind: ParsedShapeKind.Simple,
        required: true,
        type: "string",
      },
      linkType: {
        doc: "The CTA link type (e.g. URL, Phone, Email, Other).",
        kind: ParsedShapeKind.Simple,
        required: true,
        type: "string",
      },
    });
  });

  it("can parse a type imported from a file", () => {
    const parser = createParser(
      `import { TitleType } from "../__fixtures__/ComponentFile/BannerUsingTypeForProps";`
    );
    expect(parser.parseShape("TitleType")).toEqual({
      title: {
        kind: ParsedShapeKind.Simple,
        required: false,
        type: "string",
      },
    });
  });

  it("does not handle importing a type under an alias", () => {
    const parser = createParser(
      `import { TitleType as MyProps } from "../__fixtures__/ComponentFile/BannerUsingTypeForProps";`
    );
    expect(parser.parseShape("MyProps")).toBeUndefined();
  });
});

function createParser(sourceCode: string) {
  const filepath = path.resolve(__dirname, "test.tsx");
  const { project } = createTestSourceFile(sourceCode, filepath);
  return new StudioSourceFileParser(filepath, project);
}
