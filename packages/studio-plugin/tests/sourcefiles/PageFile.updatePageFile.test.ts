import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/ComponentState";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getComponentPath, getPagePath } from "../__utils__/getFixturePath";
import * as uuidUtils from "uuid";
import fs from "fs";
import { Project } from "ts-morph";
import { streamConfigMultipleFieldsComponentTree } from "../__fixtures__/componentStates";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { throwIfCalled } from "../__utils__/throwIfCalled";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { PageState } from "../../src/types/PageState";

jest.mock("uuid");

const basicPageState: PageState = {
  componentTree: [],
  cssImports: [],
  filepath: "mock-filepath",
};

const entityPageState: PageState = {
  ...basicPageState,
  pagesJS: {
    getPathValue: undefined,
    streamScope: {},
  },
};

describe("updatePageFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = createTsMorphProject();
  });

  it("updates page component based on PageState's component tree", () => {
    addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
    const pageFile = createPageFile("EmptyPage", tsMorphProject);
    pageFile.updatePageFile({
      ...basicPageState,
      componentTree: [
        {
          kind: ComponentStateKind.Standard,
          componentName: "ComplexBanner",
          props: {},
          uuid: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
        },
      ],
    });
    expectToHaveWrittenPage("EmptyPage.tsx", "PageWithAComponent");
  });

  describe("template config", () => {
    beforeEach(() => {
      jest.spyOn(uuidUtils, "v4").mockReturnValue("mock-uuid-value");
    });

    it("adds template config variable when it is not already defined", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile("PageWithAComponent", tsMorphProject);
      pageFile.updatePageFile({
        ...entityPageState,
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
        pagesJS: {
          getPathValue: undefined,
          streamScope: {
            entityTypes: ["location"],
          },
        },
      });
      expectToHaveWrittenPage("PageWithAComponent.tsx", "PageWithStreamConfig");
    });

    it("does not add template config if no stream scope is defined", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile("PageWithAComponent", tsMorphProject);
      pageFile.updatePageFile({
        ...entityPageState,
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
        pagesJS: {
          getPathValue: undefined,
          streamScope: undefined,
        },
      });
      expectToHaveWrittenPage(
        "PageWithAComponent.tsx",
        "PageWithoutStreamConfig"
      );
    });

    it("adds new stream document paths used in new page state", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile("EmptyPage", tsMorphProject);
      pageFile.updatePageFile({
        ...entityPageState,
        componentTree: streamConfigMultipleFieldsComponentTree,
      });
      expectToHaveWrittenPage(
        "EmptyPage.tsx",
        "PageWithStreamConfigMultipleFields"
      );
    });

    it("removes unused stream document paths", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile(
        "PageWithStreamConfigMultipleFields",
        tsMorphProject
      );
      pageFile.updatePageFile({
        ...entityPageState,
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
        pagesJS: {
          getPathValue: undefined,
          streamScope: {
            entityTypes: ["location"],
          },
        },
      });
      expectToHaveWrittenPage(
        "PageWithStreamConfigMultipleFields.tsx",
        "PageWithStreamConfig"
      );
    });

    it("adds stream document paths in getPath", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile("PageWithStreamConfig", tsMorphProject);
      pageFile.updatePageFile({
        ...entityPageState,
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
        pagesJS: {
          ...entityPageState.pagesJS,
          getPathValue: {
            kind: PropValueKind.Expression,
            value: "`${document.city}-${document.services[0]}`",
          },
        },
      });
      expectToHaveWrittenPage(
        "PageWithStreamConfig.tsx",
        "PageWithGetPathStreamConfig"
      );
    });

    it("does not add template props param if no stream paths in tree", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile("EmptyPage", tsMorphProject);
      pageFile.updatePageFile({
        ...entityPageState,
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
        pagesJS: {
          ...entityPageState.pagesJS,
          getPathValue: {
            kind: PropValueKind.Expression,
            value: "document.slug",
          },
        },
      });
      expectToHaveWrittenPage("EmptyPage.tsx", "PageWithNoStreamPathsInTree");
    });

    it("dedupes stream document paths", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile(
        "PageWithStreamConfigMultipleFields",
        tsMorphProject
      );
      pageFile.updatePageFile({
        ...entityPageState,
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            uuid: "mock-uuid-0",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "document.arrayIndex[0]",
                valueType: PropValueType.string,
              },
            },
            metadataUUID: "mock-metadata-uuid-0",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            uuid: "mock-uuid-1",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "document.arrayIndex[1]",
                valueType: PropValueType.string,
              },
            },
            metadataUUID: "mock-metadata-uuid-1",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            uuid: "mock-uuid-2",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "document.objectField.attr1",
                valueType: PropValueType.string,
              },
            },
            metadataUUID: "mock-metadata-uuid-2",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            uuid: "mock-uuid-3",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "document.objectField.attr2",
                valueType: PropValueType.string,
              },
            },
            metadataUUID: "mock-metadata-uuid-3",
          },
        ],
      });
      expectToHaveWrittenPage(
        "PageWithStreamConfigMultipleFields.tsx",
        "PageWithStreamConfigArrayAndObjectField"
      );
    });

    it("handles streams document usages even in ErrorComponentStates", () => {
      const pageFile = createPageFile(
        "PageWithErrorComponentState",
        tsMorphProject
      );
      pageFile.updatePageFile({
        ...entityPageState,
        componentTree: [
          {
            kind: ComponentStateKind.Error,
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "document.name",
              },
            },
            componentName: "Banner",
            fullText: `<Banner title={document.name} />`,
            uuid: "error-banner-uuid",
            metadataUUID: "error-banner-metadataUUID",
            message: "could not parse banner",
          },
        ],
      });
      expectToHaveWrittenPage(
        "PageWithErrorComponentState.tsx",
        "PageWithErrorComponentState"
      );
    });

    it("preserves 'slug' field for PagesJS PageFile", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile(
        "EmptyPageWithStreamConfigSlugField",
        tsMorphProject
      );
      pageFile.updatePageFile({
        ...entityPageState,
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
      });
      expectToHaveWrittenPage(
        "PageWithStreamConfigSlugField.tsx",
        "PageWithStreamConfigSlugField"
      );
    });

    it("updates stream scope", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const pageFile = createPageFile("PageWithStreamConfig", tsMorphProject);
      pageFile.updatePageFile({
        ...entityPageState,
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
        pagesJS: {
          getPathValue: undefined,
          streamScope: {
            entityTypes: ["product"],
          },
        },
      });
      expectToHaveWrittenPage(
        "PageWithStreamConfig.tsx",
        "PageWithModifiedStreamScope"
      );
    });
  });

  describe("getPath", () => {
    it("adds new getPath function when there is none", () => {
      const pageFile = createPageFile("EmptyPage", tsMorphProject);
      pageFile.updatePageFile({
        ...basicPageState,
        pagesJS: {
          getPathValue: { kind: PropValueKind.Literal, value: "index.html" },
        },
      });
      expectToHaveWrittenPage("EmptyPage.tsx", "PageWithGetPath");
    });

    describe("updates existing getPath function", () => {
      it("updates to modified string literal value", () => {
        const pageFile = createPageFile("PageWithGetPath", tsMorphProject);
        pageFile.updatePageFile({
          ...basicPageState,
          pagesJS: {
            getPathValue: { kind: PropValueKind.Literal, value: "static.html" },
          },
        });
        expectToHaveWrittenPage(
          "PageWithGetPath.tsx",
          "PageWithModifiedGetPath"
        );
      });

      it("updates to template expression", () => {
        const pageFile = createPageFile("PageWithGetPath", tsMorphProject);
        pageFile.updatePageFile({
          ...basicPageState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "`test-${document.slug}`",
            },
          },
        });
        expectToHaveWrittenPage(
          "PageWithGetPath.tsx",
          "PageWithTemplateGetPath"
        );
      });

      it("updates to property access expression", () => {
        const pageFile = createPageFile("PageWithGetPath", tsMorphProject);
        pageFile.updatePageFile({
          ...basicPageState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "document.slug",
            },
          },
        });
        expectToHaveWrittenPage(
          "PageWithGetPath.tsx",
          "PageWithPropertyGetPath"
        );
      });

      it("updates a getPath function without return keyword", () => {
        const pageFile = createPageFile(
          "PageWithNoReturnGetPath",
          tsMorphProject
        );
        pageFile.updatePageFile({
          ...basicPageState,
          pagesJS: {
            getPathValue: { kind: PropValueKind.Literal, value: "static.html" },
          },
        });
        expectToHaveWrittenPage(
          "PageWithNoReturnGetPath.tsx",
          "PageWithModifiedNoReturnGetPath"
        );
      });
    });

    it("does not modify getPath if getPathValue is undefined", () => {
      const pageFile = createPageFile("PageWithComplexGetPath", tsMorphProject);
      pageFile.updatePageFile({
        ...basicPageState,
        pagesJS: {
          entityFiles: ["mock-entity-file"],
          getPathValue: undefined,
        },
      });
      expectToHaveWrittenPage(
        "PageWithComplexGetPath.tsx",
        "PageWithComplexGetPath"
      );
    });
  });
});

function createPageFile(pageName: string, project: Project) {
  return new PageFile(
    getPagePath(`updatePageFile/${pageName}`),
    throwIfCalled,
    project,
    false
  );
}

function expectToHaveWrittenPage(
  destinationFilename: string,
  fixtureFile: string
) {
  expect(fs.writeFileSync).toHaveWritten(
    expect.stringContaining(destinationFilename),
    fs.readFileSync(getPagePath("updatePageFile/" + fixtureFile))
  );
}
