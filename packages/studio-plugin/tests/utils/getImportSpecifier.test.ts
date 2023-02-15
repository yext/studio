import getImportSpecifier from "../../src/utils/getImportSpecifier";

it("can import between two module files in the same directory", () => {
  const baseFile = "/src/modules/BaseFile.tsx";
  const toBeImported = "/src/modules/NewModule.tsx";
  expect(getImportSpecifier(baseFile, toBeImported)).toEqual("./NewModule");
});

it("can import files in separate folders", () => {
  const baseFile = "/a/b/BaseFile.tsx";
  const toBeImported = "/c/d/NewModule.tsx";
  expect(getImportSpecifier(baseFile, toBeImported)).toEqual(
    "../../c/d/NewModule"
  );
});
