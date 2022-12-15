import { ComponentStateKind } from "../../src/types/State";
import {
  getComponentPath,
  getModulePath,
  getPagePath,
} from "../__utils__/getFixturePath";
import fs from "fs";
import typescript from "typescript";
import { Project } from "ts-morph";
import {
  complexBannerComponent,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import ReactComponentFileWriter from "../../src/writers/ReactComponentFileWriter";
import StudioSourceFile from "../../src/files/StudioSourceFile";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { FileMetadataKind, PropShape, PropValueKind, PropValueType } from "../../src";

const propShapeMultiFields: PropShape = {
  complexBannerText: {
    type: PropValueType.string,
    doc: 'some banner title!'
  },
  complexBannerBool: {
    type: PropValueType.boolean,
    doc: 'some boolean to toggle'
  }
}

jest.mock("uuid");

describe("updateFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = new Project({
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
      },
    });
  });

  describe("React component return statement", () => {
    it("adds new sibling and children components", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("ComplexBanner"),
        getComponentPath("NestedBanner"),
      ])
      const filepath = getPagePath("updatePageFile/PageWithAComponent")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("IndexPage", sourceFile).updateFile({
        componentTree: nestedBannerComponentTree,
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithMultipleComponents"),
          "utf-8"
        )
      );
    });

    it("remove components that are not part of the new component tree", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")])
      const filepath = getPagePath("updatePageFile/PageWithMultipleComponents")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("IndexPage", sourceFile).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            props: {},
            uuid: "mock-uuid-0",
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithMultipleComponents.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithAComponent"),
          "utf-8"
        )
      );
    });
  });

  describe("imports", () => {
    it("adds css imports", () => {
      const filepath = getPagePath("updatePageFile/EmptyPage")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("IndexPage", sourceFile).updateFile({
        componentTree: [fragmentComponent],
        cssImports: ["../index.css", "./App.css"],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithCssImports"),
          "utf-8"
        )
      );
    });

    it("adds missing imports", () => {
      addFilesToProject(tsMorphProject, [
        getModulePath("PanelWithModules"),
        getComponentPath("SimpleBanner"),
      ])
      const filepath = getPagePath("updatePageFile/EmptyPage")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("IndexPage", sourceFile).updateFile({
        componentTree: [
          fragmentComponent,
          {
            kind: ComponentStateKind.Standard,
            componentName: "SimpleBanner",
            props: {},
            uuid: "mock-uuid-1",
            parentUUID: "mock-uuid-0",
          },
          {
            kind: ComponentStateKind.Module,
            componentName: "PanelWithModules",
            props: {},
            uuid: "mock-uuid-2",
            parentUUID: "mock-uuid-0",
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithComponentImports"),
          "utf-8"
        )
      );
    });

    it("removes unused imports", () => {
      const filepath = getPagePath("updatePageFile/PageWithUnusedImports")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("IndexPage", sourceFile).updateFile({
        componentTree: [fragmentComponent],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithUnusedImports.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/EmptyPage"), "utf-8")
      );
    });
  });

  describe("propShape", () => {
    it("adds propShape interface when it does not already exist in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithAComponent")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("Panel", sourceFile).updateFile({
        fileMetadata: {
          kind: FileMetadataKind.Module,
          propShape: {
            complexBannerText: {
              type: PropValueType.string,
              doc: 'title for complex banner'
            }
          },
          componentTree: [complexBannerComponent]
        },
        componentTree: [complexBannerComponent]
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithAComponent.tsx"),
        fs.readFileSync(getModulePath("updateModuleFile/ModuleWithPropShape"), "utf-8")
      );
    });

    it("updates the existing propShape interface in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithPropShape")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("Panel", sourceFile).updateFile({
        fileMetadata: {
          kind: FileMetadataKind.Module,
          propShape: propShapeMultiFields,
          componentTree: [complexBannerComponent]
        },
        componentTree: [complexBannerComponent]
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithPropShape.tsx"),
        fs.readFileSync(getModulePath("updateModuleFile/ModuleWithPropShapeMultiFields"), "utf-8")
      );
    });
  })

  describe("initialProps", () => {
    it("adds initialProps variable when it does not already exist in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithAComponent")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("Panel", sourceFile).updateFile({
        fileMetadata: {
          kind: FileMetadataKind.Module,
          propShape: {
            complexBannerText: {
              type: PropValueType.string,
              doc: 'title for complex banner'
            }
          },
          initialProps: {
            complexBannerText: {
              valueType: PropValueType.string,
              value: 'Hello world!',
              kind: PropValueKind.Literal
            },
          },
          componentTree: [complexBannerComponent]
        },
        componentTree: [complexBannerComponent]
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithAComponent.tsx"),
        fs.readFileSync(getModulePath("updateModuleFile/ModuleWithInitialProps"), "utf-8")
      );
    });

    it("updates the existing initialProps variable in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithInitialProps")
      const sourceFile = new StudioSourceFile(filepath, tsMorphProject)
      new ReactComponentFileWriter("Panel", sourceFile).updateFile({
        fileMetadata: {
          kind: FileMetadataKind.Module,
          propShape: propShapeMultiFields,
          initialProps: {
            complexBannerText: {
              valueType: PropValueType.string,
              value: 'Welcome!',
              kind: PropValueKind.Literal
            },
            complexBannerBool: {
              valueType: PropValueType.boolean,
              value: true,
              kind: PropValueKind.Literal
            },
          },
          componentTree: [complexBannerComponent]
        },
        componentTree: [complexBannerComponent]
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithInitialProps.tsx"),
        fs.readFileSync(getModulePath("updateModuleFile/ModuleWithInitialPropsMultiFields"), "utf-8")
      );
    });
  })
});
