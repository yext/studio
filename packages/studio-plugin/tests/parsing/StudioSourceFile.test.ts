import { SyntaxKind } from "ts-morph";
import StudioSourceFile from "../../src/sourcefiles/StudioSourceFile";
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
      const studioSource = new StudioSourceFile("test.tsx", project);
      expect(() => studioSource.parseExportedObjectLiteral("a")).toThrow(
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
    const studioSource = new StudioSourceFile("test.tsx", project);
    const defaultExport = studioSource.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.FunctionDeclaration);
    expect(defaultExport.getName()).toBe("test");
  });

  describe("export assignment", () => {
    it("correctly gets name of direct identifier", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default test;"
      );
      const studioSource = new StudioSourceFile("test.tsx", project);
      const defaultExport = studioSource.getDefaultExport();
      expectSyntaxKind(defaultExport, SyntaxKind.Identifier);
      expect(defaultExport.getText()).toBe("test");
    });
  });

  it("correctly gets an ObjectLiteralExpression", () => {
    const { project } = createTestSourceFile(
      "const test = 1; const no = false; export default { num: test };"
    );
    const studioSource = new StudioSourceFile("test.tsx", project);
    const defaultExport = studioSource.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });

  it("correctly gets an ObjectLiteralExpression wrapped in parenthesis", () => {
    const { project } = createTestSourceFile(
      "const test = 1; const no = false; export default ({ num: test });"
    );
    const studioSource = new StudioSourceFile("test.tsx", project);
    const defaultExport = studioSource.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });

  it("correctly gets an ArrayLiteralExpression", () => {
    const { project } = createTestSourceFile(
      "const test = 1; const no = false; export default [test];"
    );
    const studioSource = new StudioSourceFile("test.tsx", project);
    const defaultExport = studioSource.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ArrayLiteralExpression);
  });

  it("correctly gets an ObjectLiteralExpression with a type assertion", () => {
    const { project } = createTestSourceFile(
      "export default { apiKey: '123' } as SiteSettings;"
    );
    const studioSource = new StudioSourceFile("test.tsx", project);
    const defaultExport = studioSource.getDefaultExport();
    expectSyntaxKind(defaultExport, SyntaxKind.ObjectLiteralExpression);
  });
});
