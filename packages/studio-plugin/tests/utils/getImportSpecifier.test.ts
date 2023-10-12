import {
  getImportSpecifier,
  getImportSpecifierWithExtension,
} from "../../src/utils/getImportSpecifier";

describe("getImportSpecifer", () => {
  it("can import between two component files in the same directory", () => {
    const baseFile = "/src/component/BaseFile.tsx";
    const toBeImported = "/src/component/NewFile.tsx";
    expect(getImportSpecifier(baseFile, toBeImported)).toEqual("./NewFile");
  });

  it("can import files in separate folders", () => {
    const baseFile = "/a/b/BaseFile.tsx";
    const toBeImported = "/c/d/NewFile.tsx";
    expect(getImportSpecifier(baseFile, toBeImported)).toEqual(
      "../../c/d/NewFile"
    );
  });
});

describe("getImportSpecifierWithExtension", () => {
  it("can preserve extensions", () => {
    const baseFile = "/a/b/BaseFile.tsx";
    const toBeImported = "/c/d/main.css";
    expect(getImportSpecifierWithExtension(baseFile, toBeImported)).toEqual(
      "../../c/d/main.css"
    );
  });
});
