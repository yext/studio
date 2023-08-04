import { SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import expectSyntaxKind from "../__utils__/expectSyntaxKind";
import { ParsedTypeKind } from "../../src/parsers/helpers/TypeNodeParsingHelper";
import upath from "upath";

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
      kind: ParsedTypeKind.Simple,
      required: true,
      type: "string",
    },
    link: {
      kind: ParsedTypeKind.Simple,
      required: true,
      type: "string",
    },
    linkType: {
      kind: ParsedTypeKind.Simple,
      required: true,
      type: "string",
    },
  };

  it("can parse a component's prop shape defined with an interface", () => {
    const parser = createParser(
      `export default function MyComponent(props: MyProps) {};
      interface MyProps { myNum: number }`
    );
    expect(parser.parseTypeReference("MyProps")?.type).toEqual({
      myNum: {
        kind: ParsedTypeKind.Simple,
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
    expect(parser.parseTypeReference("MyProps")?.type).toEqual({
      myBool: {
        kind: ParsedTypeKind.Simple,
        type: "boolean",
        required: true,
      },
    });
  });

  it("can parse an interface imported from a file", () => {
    const parser = createParser(
      `import { SimpleBannerProps } from "../__fixtures__/StudioSourceFileParser/exportedTypes";`
    );
    expect(parser.parseTypeReference("SimpleBannerProps")?.type).toEqual({
      title: {
        kind: ParsedTypeKind.Simple,
        type: "string",
        required: false,
      },
    });
  });

  it("can parse an interface imported from an external package", () => {
    const parser = createParser(
      `import { CtaData } from "@yext/search-ui-react";`
    );
    expect(parser.parseTypeReference("CtaData")?.type).toEqual(ctaDataShape);
  });

  it("can parse a type imported from a file", () => {
    const parser = createParser(
      `import { TitleType } from "../__fixtures__/StudioSourceFileParser/exportedTypes";`
    );
    expect(parser.parseTypeReference("TitleType")?.type).toEqual({
      title: {
        kind: ParsedTypeKind.Simple,
        required: false,
        type: "string",
      },
    });
  });

  it("can parse a default imported type", () => {
    const parser = createParser(
      `import ExportedType from "../__fixtures__/StudioSourceFileParser/exportedTypes";`
    );
    expect(parser.parseTypeReference("ExportedType")?.type).toEqual({
      title: {
        kind: ParsedTypeKind.Simple,
        required: false,
        type: "string",
      },
    });
  });

  it("does not handle importing a type under an alias", () => {
    const parser = createParser(
      `import { TitleType as MyProps } from "../__fixtures__/ComponentFile/BannerUsingTypeForProps";`
    );
    expect(parser.parseTypeReference("MyProps")?.type).toBeUndefined();
  });

  it("can parse an interface with the same name as an import before aliasing", () => {
    const parser = createParser(
      `import { Props as Alias } from "aPackage";
      export interface Props { title: string }`
    );
    expect(parser.parseTypeReference("Props")?.type).toEqual({
      title: {
        kind: ParsedTypeKind.Simple,
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
    expect(parser.parseTypeReference("Props")?.type).toEqual({
      cta: {
        kind: ParsedTypeKind.Object,
        required: false,
        type: ctaDataShape,
      },
    });
  });

  it("can parse a sub-property with a renamed nested type from an external package", () => {
    const parser = createParser(
      `import { ApplyFiltersButtonProps } from "@yext/search-ui-react";
      type ButtonData = ApplyFiltersButtonProps;
      export interface Props { data?: { button: ButtonData } }`
    );
    expect(parser.parseTypeReference("Props")?.type).toEqual({
      data: {
        kind: ParsedTypeKind.Object,
        required: false,
        type: {
          button: {
            kind: ParsedTypeKind.Object,
            required: true,
            type: {
              label: {
                kind: ParsedTypeKind.Simple,
                required: false,
                type: "string",
              },
              customCssClasses: {
                kind: ParsedTypeKind.Object,
                required: false,
                type: {
                  button: {
                    kind: ParsedTypeKind.Simple,
                    required: false,
                    type: "string",
                  },
                },
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
    expect(parser.parseTypeReference("Props")?.type).toEqual({
      data: {
        kind: ParsedTypeKind.Object,
        required: false,
        type: {
          num: {
            kind: ParsedTypeKind.Simple,
            required: true,
            type: "number",
          },
        },
      },
    });
  });

  it("can parse an interface with primitive array item type in same file", () => {
    const parser = createParser(
      `type Num = number;
      export interface Props { data?: Array<Num> }`
    );
    expect(parser.parseTypeReference("Props")?.type).toEqual({
      data: {
        kind: ParsedTypeKind.Array,
        required: false,
        type: {
          kind: ParsedTypeKind.Simple,
          type: "number",
        },
      },
    });
  });

  it("can parse an interface with sub-property type from other file", () => {
    const parser = createParser(
      `import { MyString } from "../__fixtures__/StudioSourceFileParser/exportedTypes";
      export interface Props { data?: { title: MyString } }`
    );
    expect(parser.parseTypeReference("Props")?.type).toEqual({
      data: {
        kind: ParsedTypeKind.Object,
        required: false,
        type: {
          title: {
            kind: ParsedTypeKind.Simple,
            required: true,
            type: "string",
          },
        },
      },
    });
  });

  it("can parse a type that is a Record<string, any>", () => {
    const parser = createParser(
      `export interface MyProps { document: Record<string, any>; }`
    );
    expect(parser.parseTypeReference("MyProps")).toEqual({
      kind: ParsedTypeKind.Object,
      type: {
        document: {
          kind: ParsedTypeKind.Simple,
          required: true,
          type: "Record<string, any>",
        },
      },
    });
  });

  it("can parse a string union that includes another string union", () => {
    const parser = createParser(
      `import { AppleOrPear } from "../__fixtures__/StudioSourceFileParser/stringUnions.ts";
      export type Fruits = 'yuzu' | AppleOrPear
      `
    );
    expect(parser.parseTypeReference("Fruits")).toEqual({
      kind: ParsedTypeKind.Simple,
      type: "string",
      unionValues: ["yuzu", "apple", "pear"],
    });
  });

  it("can parse a string union with a type reference to a string literal", () => {
    const parser = createParser(
      `import { Orange } from "../__fixtures__/StudioSourceFileParser/stringUnions.ts";
      export type Citrus = 'yuzu' | Orange
      `
    );
    expect(parser.parseTypeReference("Citrus")).toEqual({
      kind: ParsedTypeKind.Simple,
      type: "string",
      unionValues: ["yuzu", "orange"],
    });
  });

  it("can parse a string literal", () => {
    const parser = createParser(`type MyLiteral = 'my literal'`);
    expect(parser.parseTypeReference("MyLiteral")).toEqual({
      kind: ParsedTypeKind.StringLiteral,
      type: "my literal",
    });
  });
});

it("checkForSyntaxErrors throws when a tsx file has a syntax error", () => {
  const parser = createParser(`const Banner = () => <div>Banner Text<div>`);
  expect(() => parser.checkForSyntaxErrors()).toThrowError(
    /test.tsx: Unexpected token \(1:42/
  );
});

function createParser(sourceCode: string) {
  const filepath = upath.resolve(__dirname, "test.tsx");
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
