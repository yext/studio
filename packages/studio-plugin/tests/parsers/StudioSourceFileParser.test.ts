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
  const ctaDataShape = {
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
  };

  it("can parse a component's prop shape defined with an interface", () => {
    const parser = createParser(
      `export default function MyComponent(props: MyProps) {};
      interface MyProps { myNum: number }`
    );
    expect(parser.parseShape("MyProps")?.type).toEqual({
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
    expect(parser.parseShape("MyProps")?.type).toEqual({
      myBool: {
        kind: ParsedShapeKind.Simple,
        type: "boolean",
        required: true,
      },
    });
  });

  it("can parse an interface imported from a file", () => {
    const parser = createParser(
      `import { SimpleBannerProps } from "../__fixtures__/StudioSourceFileParser/exportedTypes";`
    );
    expect(parser.parseShape("SimpleBannerProps")?.type).toEqual({
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
    expect(parser.parseShape("CtaData")?.type).toEqual(ctaDataShape);
  });

  it("can parse a type imported from a file", () => {
    const parser = createParser(
      `import { TitleType } from "../__fixtures__/StudioSourceFileParser/exportedTypes";`
    );
    expect(parser.parseShape("TitleType")?.type).toEqual({
      title: {
        kind: ParsedShapeKind.Simple,
        required: false,
        type: "string",
      },
    });
  });

  it("can parse a default imported type", () => {
    const parser = createParser(
      `import ExportedType from "../__fixtures__/StudioSourceFileParser/exportedTypes";`
    );
    expect(parser.parseShape("ExportedType")?.type).toEqual({
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
    expect(parser.parseShape("MyProps")?.type).toBeUndefined();
  });

  it("can parse an interface with the same name as an import before aliasing", () => {
    const parser = createParser(
      `import { Props as Alias } from "aPackage";
      export interface Props { title: string }`
    );
    expect(parser.parseShape("Props")?.type).toEqual({
      title: {
        kind: ParsedShapeKind.Simple,
        required: true,
        type: "string",
      },
    });
  });

  it("can parse a type with a property imported from an external package", () => {
    const parser = createParser(
      `import { CtaData } from "@yext/search-ui-react";
      export type Props = { cta?: CtaData }`
    );
    expect(parser.parseShape("Props")?.type).toEqual({
      cta: {
        kind: ParsedShapeKind.Nested,
        required: false,
        type: ctaDataShape,
      },
    });
  });

  it("can parse a property with a renamed nested type from an external package", () => {
    const parser = createParser(
      `import { ApplyFiltersButtonProps } from "@yext/search-ui-react";
      type ButtonData = ApplyFiltersButtonProps;
      export interface Props { button: ButtonData };`
    );
    expect(parser.parseShape("Props")?.type).toEqual({
      button: {
        kind: ParsedShapeKind.Nested,
        required: true,
        type: {
          label: {
            kind: ParsedShapeKind.Simple,
            required: false,
            type: "string",
            doc: "The label for the button, defaults to 'Apply Filters'",
          },
          customCssClasses: {
            kind: ParsedShapeKind.Nested,
            required: false,
            type: {
              button: {
                kind: ParsedShapeKind.Simple,
                required: false,
                type: "string",
              },
            },
          },
        },
      },
    });
  });

  it("can parse an interface with primitive sub-property type in same file", () => {
    const parser = createParser(
      `type Num = number;
      export interface Props { data?: { num: Num } }`
    );
    expect(parser.parseShape("Props")?.type).toEqual({
      data: {
        kind: ParsedShapeKind.Nested,
        required: false,
        type: {
          num: {
            kind: ParsedShapeKind.Simple,
            required: true,
            type: "number",
          },
        },
      },
    });
  });

  it("can parse an interface with sub-property type from other file", () => {
    const parser = createParser(
      `import { MyString } from "../__fixtures__/StudioSourceFileParser/exportedTypes";
      export interface Props { data?: { title: MyString } }`
    );
    expect(parser.parseShape("Props")?.type).toEqual({
      data: {
        kind: ParsedShapeKind.Nested,
        required: false,
        type: {
          title: {
            kind: ParsedShapeKind.Simple,
            required: true,
            type: "string",
          },
        },
      },
    });
  });
});

function createParser(sourceCode: string) {
  const filepath = path.resolve(__dirname, "test.tsx");
  const { project } = createTestSourceFile(sourceCode, filepath);
  return new StudioSourceFileParser(filepath, project);
}

describe("parseNamedImports", () => {
  it("does not support aliased imports", () => {
    const parser = createParser(
      `import { TheirType as MyAlias } from "aPackage";`
    );
    expect(parser.parseNamedImports()).toEqual({
      aPackage: ["TheirType"],
    });
  });
});
