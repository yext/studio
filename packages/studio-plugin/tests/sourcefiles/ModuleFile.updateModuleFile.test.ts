import fs from "fs";
import { Project } from "ts-morph";
import ModuleFile from "../../src/sourcefiles/ModuleFile";
import { FileMetadataKind } from "../../src";
import { getComponentPath, getModulePath } from "../__utils__/getFixturePath";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { complexBannerComponent } from "../__fixtures__/componentStates";
import { throwIfCalled } from "../__utils__/throwIfCalled";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";

jest.mock("uuid");

describe("updateModuleFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .spyOn(ModuleFile.prototype as any, "getComponentName")
      .mockImplementation(() => "Panel");
    tsMorphProject = createTsMorphProject();
  });

  it("updates page component based on ModuleFileMetadata's component tree", () => {
    addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
    const moduleFile = new ModuleFile(
      getModulePath("updateModuleFile/EmptyModule"),
      throwIfCalled,
      jest.fn(),
      tsMorphProject
    );
    moduleFile.updateModuleFile({
      kind: FileMetadataKind.Module,
      componentTree: [complexBannerComponent],
      metadataUUID: "mock-uuid",
      filepath: "mock-filepath",
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
