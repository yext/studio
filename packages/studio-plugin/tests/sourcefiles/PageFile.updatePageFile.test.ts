import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/State";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getComponentPath, getPagePath } from "../__utils__/getFixturePath";
import * as uuidUtils from "uuid";
import fs from "fs";
import { Project } from "ts-morph";
import { streamConfigMultipleFieldsComponentTree } from "../__fixtures__/componentStates";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { throwIfCalled } from "../__utils__/throwIfCalled";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";

jest.mock("uuid");

describe("updatePageFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = createTsMorphProject();
  });

  it("updates page component based on PageState's component tree", () => {
    addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
    const pageFile = new PageFile(
      getPagePath("updatePageFile/EmptyPage"),
      throwIfCalled,
      jest.fn(),
      tsMorphProject
    );
    pageFile.updatePageFile({
      componentTree: [
        {
          kind: ComponentStateKind.Standard,
          componentName: "ComplexBanner",
          props: {},
          uuid: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
        },
      ],
      cssImports: [],
      filepath: "mock-filepath",
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("EmptyPage.tsx"),
      fs.readFileSync(getPagePath("updatePageFile/PageWithAComponent"), "utf-8")
    );
  });

  describe("stream config", () => {
    beforeEach(() => {
      jest.spyOn(uuidUtils, "v4").mockReturnValue("mock-uuid-value");
    });

    it("adds template config variable when it is not already defined", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithAComponent"),
        throwIfCalled,
        jest.fn(),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "ComplexBanner",
              uuid: "mock-uuid-0",
              props: {
                title: {
                  kind: PropValueKind.Expression,
                  value: "document.title",
                  valueType: PropValueType.string,
                },
              },
              metadataUUID: "mock-metadata-uuid",
            },
          ],
          cssImports: [],
          filepath: "mock-filepath",
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfig"),
          "utf-8"
        )
      );
    });

    it("does not add stream config if it is not already defined and no document paths are used", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithAComponent"),
        throwIfCalled,
        jest.fn(),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "ComplexBanner",
              uuid: "mock-uuid-0",
              props: {
                title: {
                  kind: PropValueKind.Literal,
                  value: "title",
                  valueType: PropValueType.string,
                },
              },
              metadataUUID: "mock-metadata-uuid",
            },
          ],
          cssImports: [],
          filepath: "mock-filepath",
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithoutStreamConfig"),
          "utf-8"
        )
      );
    });

    it("adds new stream document paths used in new page state", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/EmptyPage"),
        throwIfCalled,
        jest.fn(),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: streamConfigMultipleFieldsComponentTree,
          cssImports: [],
          filepath: "mock-filepath",
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
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/PageWithStreamConfigMultipleFields"),
        throwIfCalled,
        jest.fn(),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "ComplexBanner",
              uuid: "mock-uuid-0",
              props: {
                title: {
                  kind: PropValueKind.Expression,
                  value: "document.title",
                  valueType: PropValueType.string,
                },
              },
              metadataUUID: "mock-metadata-uuid",
            },
          ],
          cssImports: [],
          filepath: "mock-filepath",
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

    it("preserves 'slug' field for PagesJS PageFile", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = new PageFile(
        getPagePath("updatePageFile/EmptyPageWithStreamConfigSlugField"),
        throwIfCalled,
        jest.fn(),
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "ComplexBanner",
              uuid: "mock-uuid-0",
              props: {
                title: {
                  kind: PropValueKind.Expression,
                  value: "document.title",
                  valueType: PropValueType.string,
                },
              },
              metadataUUID: "mock-metadata-uuid",
            },
          ],
          cssImports: [],
          filepath: "mock-filepath",
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfigSlugField.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfigSlugField"),
          "utf-8"
        )
      );
    });
  });
});
