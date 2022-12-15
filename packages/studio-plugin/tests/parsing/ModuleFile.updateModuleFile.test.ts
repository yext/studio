import fs from "fs";
import typescript from "typescript";
import { Project } from "ts-morph";
import ModuleFile from "../../src/sourcefiles/ModuleFile";
import { FileMetadataKind } from "../../src";
import { getComponentPath, getModulePath } from "../__utils__/getFixturePath";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { complexBannerComponent } from "../__fixtures__/componentStates";

jest.mock("uuid");

describe("updateModuleFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest
      .spyOn(ModuleFile.prototype as any, "getComponentName")
      .mockImplementation(() => "Panel");
    tsMorphProject = new Project({
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
      },
    });
  });

  it("updates page component based on ModuleFileMetadata's component tree", () => {
    addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
    const moduleFile = new ModuleFile(
      getModulePath("updateModuleFile/EmptyModule"),
      tsMorphProject
    );
    moduleFile.updateModuleFile({
      kind: FileMetadataKind.Module,
      componentTree: [complexBannerComponent],
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("EmptyModule.tsx"),
      fs.readFileSync(
        getModulePath("updateModuleFile/ModuleWithAComponent"),
        "utf-8"
      )
    );
  });
});
