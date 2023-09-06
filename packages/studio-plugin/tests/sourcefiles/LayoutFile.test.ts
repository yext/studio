import LayoutFile from "../../src/sourcefiles/LayoutFile";
import { createTestProject } from "../__utils__/createTestSourceFile";
import { getLayoutPath } from "../__utils__/getFixturePath";

function createNewLayoutFile(filepath: string) {
  return new LayoutFile(
    getLayoutPath(filepath),
    createTestProject(),
  )
}

it("can parse layout name with export default in line with function declarations", () => {
  const layoutFile = createNewLayoutFile("FunctionInlineExportLayout");
  const layoutName = layoutFile.getLayoutName();
  expect(layoutName).toBe("FunctionInlineExportLayout");
})

it("can parse layout name with export default at the end of the file", () => {
  const layoutFile = createNewLayoutFile("EndOfFileExportLayout");
  const layoutName = layoutFile.getLayoutName();
  expect(layoutName).toBe("EndOfFileExportLayout");
})