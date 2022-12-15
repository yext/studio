import PageFile from "../../src/files/PageFile";
import { ComponentStateKind } from "../../src/types/State";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import {
  getComponentPath,
  getModulePath,
  getPagePath,
} from "../__utils__/getFixturePath";
import * as uuidUtils from "uuid";
import fs from "fs";
import ComponentFile from "../../src/files/ComponentFile";
import typescript from "typescript";
import { Project } from "ts-morph";
import {
  fragmentComponent,
  nestedBannerComponentTree,
  streamConfigMultipleFieldsComponentTree,
} from "../__fixtures__/componentStates";

jest.mock("uuid");

describe("updatePageFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = new Project({
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
      },
    });
  });

  describe("page return statement", () => {
    it("adds new sibling and children components", () => {
      new ComponentFile(getComponentPath("ComplexBanner"), tsMorphProject);
      new ComponentFile(getComponentPath("NestedBanner"), tsMorphProject);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithAComponent"),
        tsMorphProject
      );
      pageFile.updatePageFile({
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

    it("remove components that are not part of the new page's component tree", () => {
      new ComponentFile(getComponentPath("ComplexBanner"), tsMorphProject);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithMultipleComponents"),
        tsMorphProject
      );
      pageFile.updatePageFile({
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

  describe("stream config", () => {
    beforeEach(() => {
      jest.spyOn(uuidUtils, "v4").mockReturnValue("mock-uuid-value");
    });

    it("adds template config variable when it is not already defined", () => {
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/EmptyPage"),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "SimpleBanner",
              uuid: "mock-uuid-0",
              props: {
                title: {
                  kind: PropValueKind.Expression,
                  value: "document.title",
                  valueType: PropValueType.string,
                },
              },
            },
          ],
          cssImports: [],
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfig"),
          "utf-8"
        )
      );
    });

    it("adds new stream document paths used in new page state", () => {
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/EmptyPage"),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: streamConfigMultipleFieldsComponentTree,
          cssImports: [],
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfigMultipleFields"),
          "utf-8"
        )
      );
    });

    it("removes unused stream document paths", () => {
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithStreamConfigMultipleFields"),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "SimpleBanner",
              uuid: "mock-uuid-0",
              props: {
                title: {
                  kind: PropValueKind.Expression,
                  value: "document.title",
                  valueType: PropValueType.string,
                },
              },
            },
          ],
          cssImports: [],
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfigMultipleFields.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfig"),
          "utf-8"
        )
      );
    });
  });

  describe("imports", () => {
    it("adds css imports", () => {
      const pageFile = new PageFile(
        getPagePath("updatePageFile/EmptyPage"),
        tsMorphProject
      );
      pageFile.updatePageFile({
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
      new ComponentFile(getModulePath("PanelWithModules"), tsMorphProject);
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/EmptyPage"),
        tsMorphProject
      );
      pageFile.updatePageFile({
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
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithUnusedImports"),
        tsMorphProject
      );
      pageFile.updatePageFile({
        componentTree: [fragmentComponent],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithUnusedImports.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/EmptyPage"), "utf-8")
      );
    });
  });
});
