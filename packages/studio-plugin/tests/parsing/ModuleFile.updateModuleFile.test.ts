import fs from "fs";
import typescript from "typescript";
import { Project } from "ts-morph";
import ModuleFile from "../../src/parsing/ModuleFile";
import { ComponentStateKind, FileMetadataKind, PropValueKind, PropValueType } from "../../src";
import { getModulePath } from "../__utils__/getFixturePath";

jest.mock("uuid");

describe("updateModuleFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = new Project({
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
      },
    });
  });

  it("test", () => {
    const moduleFile = new ModuleFile(
      getModulePath("PanelWithModules"),
      tsMorphProject
    );
    moduleFile.updateModuleFile({
      kind: FileMetadataKind.Module,
      propShape: {
        hello: {
          type: PropValueType.string,
          doc: 'hello world!'
        }
      },
      initialProps: {
        hello: {
          valueType: PropValueType.string,
          value: 'welcome!',
          kind: PropValueKind.Literal
        },
        foo: {
          valueType: PropValueType.string,
          value: 'barr!',
          kind: PropValueKind.Literal
        },
        bool: {
          valueType: PropValueType.boolean,
          value: true,
          kind: PropValueKind.Literal
        }
      },
      componentTree: [{
        kind: ComponentStateKind.Fragment,
        uuid: "mock-uuid-0",
      }]
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("PanelWithModules.tsx"),
      fs.readFileSync(getModulePath("PanelWithModules"), "utf-8")
    );
  });
});
