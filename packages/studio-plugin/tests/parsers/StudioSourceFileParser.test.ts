import { SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import expectSyntaxKind from "../__utils__/expectSyntaxKind";

describe("parseExportedObjectLiteral", () => {
  it(
    "Throws an Error when an exported variable with the name is found" +
      ", but it is not an ObjectLiteralExpression",
    () => {
      const { project } = createTestSourceFile(
        'export const a = "not an object";'
      );
      const studioSourceFileParser = new StudioSourceFileParser(
        "test.tsx",
        project
      );
      expect(() =>
        studioSourceFileParser.parseExportedObjectLiteral("a")
      ).toThrow(
        'Could not find ObjectLiteralExpression within `export const a = "not an object";`'
      );
    }
  );
});

describe("getDefaultExport", () => {
  it("correctly gets direct function declaration", () => {
    const { project } = createTestSourceFile(
      "export const no = false; export default function test() {}"
    );
    const studioSourceFileParser = new StudioSourceFileParser(
      "test.tsx",
      project
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.FunctionDeclaration);
    expect(defaultExport.getName()).toBe("test");
  });

  describe("export assignment", () => {
    it("correctly gets name of direct identifier", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default test;"
      );
      const studioSourceFileParser = new StudioSourceFileParser(
        "test.tsx",
        project
      );
      const defaultExport = studioSourceFileParser.getDefaultExport();
      expectSyntaxKind(defaultExport, SyntaxKind.Identifier);
      expect(defaultExport.getText()).toBe("test");
    });
  });

  it("correctly gets an ObjectLiteralExpression", () => {
    const { project } = createTestSourceFile(
      "const test = 1; const no = false; export default { num: test };"
    );
    const studioSourceFileParser = new StudioSourceFileParser(
      "test.tsx",
      project
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });

  it("correctly gets an ObjectLiteralExpression wrapped in parenthesis", () => {
    const { project } = createTestSourceFile(
      "const test = 1; const no = false; export default ({ num: test });"
    );
    const studioSourceFileParser = new StudioSourceFileParser(
      "test.tsx",
      project
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });

  it("correctly gets an ArrayLiteralExpression", () => {
    const { project } = createTestSourceFile(
      "const test = 1; const no = false; export default [test];"
    );
    const studioSourceFileParser = new StudioSourceFileParser(
      "test.tsx",
      project
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ArrayLiteralExpression);
  });

  it("correctly gets an ObjectLiteralExpression with a type assertion", () => {
    const { project } = createTestSourceFile(
      "export default { apiKey: '123' } as SiteSettings;"
    );
    const studioSourceFileParser = new StudioSourceFileParser(
      "test.tsx",
      project
    );
    const defaultExport = studioSourceFileParser.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });
});

describe("isNamedNpmImport", () => {
  it("correctly identifies an import as a named import from a node module", () => {
    const { project } = createTestSourceFile(
      `import { SampleComponent } from "@yext/sample-component";`
    );
    const studioSourceFileParser = new StudioSourceFileParser(
      "test.tsx",
      project
    );
    const isNamedNpmImport = studioSourceFileParser.isNamedNpmImport(
      "@yext/sample-component",
      ["SampleComponent"]
    );
    expect(isNamedNpmImport).toBe(true);
  });
  describe("throws errors", () => {
    it("throws an error when trying to import a default import from a node module", () => {
      const { project } = createTestSourceFile(
        `import { SampleComponent } from "@yext/sample-component";`
      );
      const studioSourceFileParser = new StudioSourceFileParser(
        "test.tsx",
        project
      );
      const isNamedNpmImport = studioSourceFileParser.isNamedNpmImport(
        "@yext/sample-component",
        "SampleComponent"
      );
      expect(isNamedNpmImport).toBe(false);
    });
    it("throws an error when trying to import named imports from a relative path", () => {
      const { project } = createTestSourceFile(
        `import { SampleComponent } from "@yext/sample-component";`
      );
      const studioSourceFileParser = new StudioSourceFileParser(
        "test.tsx",
        project
      );
      const isNamedNpmImport = studioSourceFileParser.isNamedNpmImport(
        "../src/components",
        ["SampleComponent"]
      );
      expect(isNamedNpmImport).toBe(false);
    });
  });
});
