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
