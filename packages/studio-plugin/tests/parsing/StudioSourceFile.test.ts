import { SyntaxKind } from "ts-morph";
import StudioSourceFile from "../../src/parsing/StudioSourceFile";
import createTestSourceFile from "../__utils__/createTestSourceFile";

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

describe("parseDefaultExport", () => {
  it("correctly parses direct function declaration", () => {
    const { project } = createTestSourceFile(
      "export const no = false; export default function test() {}"
    );
    const studioSource = new StudioSourceFile("test.tsx", project);
    const defaultExport = studioSource.parseDefaultExport();
    expect(defaultExport.isKind(SyntaxKind.FunctionDeclaration));
    expect(defaultExport.getName()).toBe("test");
  });

  describe("export assignment", () => {
    it("correctly parses direct identifier of variable declaration", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default test;"
      );
      const studioSource = new StudioSourceFile("test.tsx", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });

    it("correctly parses direct identifier of function declaration", () => {
      const { project } = createTestSourceFile(
        "function test() {}; const no = false; export default test;"
      );
      const studioSource = new StudioSourceFile("test.tsx", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.FunctionDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });
  });

  describe("errors", () => {
    it( "throws an error for object", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default { num: test };"
      );
      const studioSource = new StudioSourceFile("test.tsx", project);
      expect(() => studioSource.parseDefaultExport()).toThrow(
        "Error getting default export: Only a direct Identifier is supported for ExportAssignment."
      );
    });

    it("throws an error for array", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default [test];"
      );
      const studioSource = new StudioSourceFile("test.tsx", project);
      expect(() => studioSource.parseDefaultExport()).toThrow(
        "Error getting default export: Only a direct Identifier is supported for ExportAssignment."
      );
    });
  });
});
