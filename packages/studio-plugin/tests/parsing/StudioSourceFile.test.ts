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
      const studioSource = new StudioSourceFile("test.ts", project);
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
    const studioSource = new StudioSourceFile("test.ts", project);
    const defaultExport = studioSource.parseDefaultExport();
    expect(defaultExport.isKind(SyntaxKind.FunctionDeclaration));
    expect(defaultExport.getName()).toBe("test");
  });

  describe("export assignment of variable declaration", () => {
    it(
      "correctly parses object with single regular property assignment",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { num: test } as Test;"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        const defaultExport = studioSource.parseDefaultExport();
        expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
        expect(defaultExport.getName()).toBe("test");
      }
    );

    it(
      "correctly parses object with single shorthand property assignment",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { test };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        const defaultExport = studioSource.parseDefaultExport();
        expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
        expect(defaultExport.getName()).toBe("test");
      }
    );

    it("correctly parses direct identifier", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default test;"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });
  });

  describe("export assignment of function declaration", () => {
    it("correctly parses object with single property assignment", () => {
      const { project } = createTestSourceFile(
        "function test() {}; const no = false; export default { num: test } as Test;"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.FunctionDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });

    it("correctly parses direct identifier", () => {
      const { project } = createTestSourceFile(
        "function test() {}; const no = false; export default test;"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.FunctionDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });
  });

  describe("errors", () => {
    it(
      "throws an error for object with multiple regular property assignments",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { num: test, bool: no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        expect(() => studioSource.parseDefaultExport()).toThrow(
          "Error getting default export: Multiple properties found for ObjectLiteralExpression ExportAssignment."
        );
      }
    );

    it(
      "throws an error for object with multiple shorthand property assignments",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { test, no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        expect(() => studioSource.parseDefaultExport()).toThrow(
          "Error getting default export: Multiple properties found for ObjectLiteralExpression ExportAssignment."
        );
      }
    );

    it(
      "throws an error for object with shorthand property assignment first",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { test, bool: no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        expect(() => studioSource.parseDefaultExport()).toThrow(
          "Error getting default export: Multiple properties found for ObjectLiteralExpression ExportAssignment."
        );
      }
    );

    it(
      "throws an error for object with regular property assignment first",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { num: test, no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        expect(() => studioSource.parseDefaultExport()).toThrow(
          "Error getting default export: Multiple properties found for ObjectLiteralExpression ExportAssignment."
        );
      }
    );

    it("throws an error for object with no properties", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default {};"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      expect(() => studioSource.parseDefaultExport()).toThrow(
        "Error getting default export: No properties found for ObjectLiteralExpression ExportAssignment."
      );
    });

    it(
      "throws an error for object with single property assignment initialized inline",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { num: 1 };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        expect(() => studioSource.parseDefaultExport()).toThrow(
          /^Expected to find an initializer of kind 'Identifier'./
        );
      }
    );

    it("throws an error for array", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default [test];"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      expect(() => studioSource.parseDefaultExport()).toThrow(
        "Error getting default export: ArrayLiteralExpresion is not supported for ExportAssignment."
      );
    });
  });
});
