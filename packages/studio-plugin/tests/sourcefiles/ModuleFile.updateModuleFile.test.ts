import fs from "fs";
import { Project } from "ts-morph";
import ModuleFile from "../../src/sourcefiles/ModuleFile";
import {
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  PropValueKind,
  PropValues,
  PropValueType,
  PropShape,
} from "../../src/types";
import { getComponentPath, getModulePath } from "../__utils__/getFixturePath";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { complexBannerComponent } from "../__fixtures__/componentStates";
import { throwIfCalled } from "../__utils__/throwIfCalled";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { TypelessPropVal } from "../../lib";

jest.mock("uuid");

describe("updateModuleFile", () => {
  let tsMorphProject: Project;
  let moduleFile: ModuleFile;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = createTsMorphProject();
    addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
    moduleFile = new ModuleFile(
      getModulePath("updateModuleFile/EmptyModule"),
      throwIfCalled,
      tsMorphProject
    );
  });

  it("updates page component based on ModuleFileMetadata's component tree", () => {
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

  it("handles destructuring a document prop in the function arg", () => {
    const childPropValues: PropValues = {
      title: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value: "`title - ${document.anything}`",
      },
      num: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.number,
        value: "props.parentNum",
      },
    };
    const propShape: PropShape = {
      document: {
        type: PropValueType.Record,
        recordKey: "string",
        recordValue: "any",
        required: true,
      },
      parentNum: {
        type: PropValueType.number,
        required: false,
      },
    };
    moduleFile.updateModuleFile(
      createModuleMetadata(childPropValues, propShape)
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("EmptyModule.tsx"),
      fs.readFileSync(
        getModulePath("updateModuleFile/ModuleUsingDocument"),
        "utf-8"
      )
    );
  });

  it("handles document props used in ErrorComponentStates", () => {
    const childPropValues: Record<string, TypelessPropVal> = {
      title: {
        kind: PropValueKind.Expression,
        value: "document.name",
      },
    };
    moduleFile.updateModuleFile({
      kind: FileMetadataKind.Module,
      componentTree: [
        {
          kind: ComponentStateKind.Error,
          componentName: "ErrBanner",
          props: childPropValues,
          fullText: "<ErrBanner title={document.name}/>",
          message: "could not render ErrBanner",
          uuid: "errbanner-uuid",
          metadataUUID: "errbanner-metadata",
        },
      ],
      propShape: {
        document: {
          type: PropValueType.Record,
          recordKey: "string",
          recordValue: "any",
          required: true,
        },
      },
      metadataUUID: "mock-uuid",
      filepath: "mock-filepath",
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("EmptyModule.tsx"),
      fs.readFileSync(
        getModulePath("updateModuleFile/ModuleWithErrBanner"),
        "utf-8"
      )
    );
  });
});

function createModuleMetadata(
  childPropValues: PropValues,
  propShape: PropShape
): ModuleMetadata {
  return {
    kind: FileMetadataKind.Module,
    componentTree: [
      {
        kind: ComponentStateKind.Standard,
        componentName: "ComplexBanner",
        props: childPropValues,
        uuid: "mock-uuid-0",
        metadataUUID: "complexbanner-metadata",
      },
    ],
    metadataUUID: "mock-uuid",
    filepath: "mock-filepath",
    propShape,
  };
}
