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

  describe('export assignment of variable declaration', () => {
    it(
      "correctly parses object with only regular property assignments",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { num: test, bool: no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        const defaultExport = studioSource.parseDefaultExport();
        expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
        expect(defaultExport.getName()).toBe("test");
      }
    );

    it(
      "correctly parses object with only shorthand property assignments",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { test, no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        const defaultExport = studioSource.parseDefaultExport();
        expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
        expect(defaultExport.getName()).toBe("test");
      }
    );

    it(
      "correctly parses object with shorthand property assignment first",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { test, bool: no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        const defaultExport = studioSource.parseDefaultExport();
        expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
        expect(defaultExport.getName()).toBe("test");
      }
    );

    it(
      "correctly parses object with regular property assignment first",
      () => {
        const { project } = createTestSourceFile(
          "const test = 1; const no = false; export default { num: test, no };"
        );
        const studioSource = new StudioSourceFile("test.ts", project);
        const defaultExport = studioSource.parseDefaultExport();
        expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
        expect(defaultExport.getName()).toBe("test");
      }
    );

    it("correctly parses array", () => {
      const { project } = createTestSourceFile(
        "const test = 1; const no = false; export default [test, no];"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.VariableDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });

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

  describe('export assignment of function declaration', () => {
    it("correctly parses object", () => {
      const { project } = createTestSourceFile(
        "function test() {}; const no = false; export default { num: test, no };"
      );
      const studioSource = new StudioSourceFile("test.ts", project);
      const defaultExport = studioSource.parseDefaultExport();
      expect(defaultExport.isKind(SyntaxKind.FunctionDeclaration));
      expect(defaultExport.getName()).toBe("test");
    });

    it("correctly parses array", () => {
      const { project } = createTestSourceFile(
        "function test() {}; const no = false; export default [test, no];"
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
});
