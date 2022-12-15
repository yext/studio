import PageFile from "../../src/files/PageFile";
import { ComponentStateKind } from "../../src/types/State";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import {
  getComponentPath,
  getPagePath,
} from "../__utils__/getFixturePath";
import * as uuidUtils from "uuid";
import fs from "fs";
import typescript from "typescript";
import { Project } from "ts-morph";
import {
  streamConfigMultipleFieldsComponentTree,
} from "../__fixtures__/componentStates";
import { addFilesToProject } from "../__utils__/addFilesToProject";

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

  it("updates page component based on PageState's component tree", () => {
    addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")])
    const pageFile = new PageFile(getPagePath("updatePageFile/EmptyPage"), tsMorphProject)
    pageFile.updatePageFile({
      componentTree: [{
        kind: ComponentStateKind.Standard,
        componentName: "ComplexBanner",
        props: {},
        uuid: "mock-uuid-0",
      }],
      cssImports: [],
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("EmptyPage.tsx"),
      fs.readFileSync(
        getPagePath("updatePageFile/PageWithAComponent"),
        "utf-8"
      )
    );
  });

  describe("stream config", () => {
    beforeEach(() => {
      jest.spyOn(uuidUtils, "v4").mockReturnValue("mock-uuid-value");
    });

    it("adds template config variable when it is not already defined", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("SimpleBanner")])
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
      addFilesToProject(tsMorphProject, [getComponentPath("SimpleBanner")])
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
      addFilesToProject(tsMorphProject, [getComponentPath("SimpleBanner")])
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
});
