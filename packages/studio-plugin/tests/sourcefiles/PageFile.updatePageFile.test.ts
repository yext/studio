import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/ComponentState";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getComponentPath, getPagePath } from "../__utils__/getFixturePath";
import * as uuidUtils from "uuid";
import fs from "fs";
import { Project } from "ts-morph";
import { streamConfigMultipleFieldsComponentTree } from "../__fixtures__/componentStates";
import { throwIfCalled } from "../__utils__/throwIfCalled";
import { PageState } from "../../src/types/PageState";
import upath from "upath";
import { createTestProject } from "../__utils__/createTestSourceFile";
import { FileMetadata, FileMetadataKind } from "../../src/types";

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

const UUIDToFileMetadata: Record<string, FileMetadata> = {
  "mock-metadata-uuid": {
    kind: FileMetadataKind.Component,
    metadataUUID: "mock-metadata-uuid",
    filepath: getComponentPath("ComplexBanner"),
    cssImports: [],
  },
};

describe("updatePageFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = createTestProject();
  });

  it("updates page component based on PageState's component tree", () => {
    const pageFile = createPageFile("EmptyPage", tsMorphProject);
    pageFile.updatePageFile(
      {
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
      },
      UUIDToFileMetadata
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("EmptyPage.tsx"),
      fs.readFileSync(getPagePath("updatePageFile/PageWithAComponent"), "utf-8")
    );
  });

  describe("template config", () => {
    beforeEach(() => {
      jest.spyOn(uuidUtils, "v4").mockReturnValue("mock-uuid-value");
      jest.spyOn(upath, "basename").mockReturnValue("test");
    });

    it("adds template config variable when it is not already defined", () => {
      const pageFile = createPageFile("PageWithAComponent", tsMorphProject);
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfig"),
          "utf-8"
        )
      );
    });

    it("does not add template config if no stream scope is defined", () => {
      const pageFile = createPageFile("PageWithAComponent", tsMorphProject);
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
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
      const pageFile = createPageFile("EmptyPage", tsMorphProject);
      pageFile.updatePageFile(
        {
          ...entityPageState,
          componentTree: streamConfigMultipleFieldsComponentTree,
        },
        UUIDToFileMetadata
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
      const pageFile = createPageFile(
        "PageWithStreamConfigMultipleFields",
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfigMultipleFields.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfig"),
          "utf-8"
        )
      );
    });

    it("adds stream document paths in getPath", () => {
      const pageFile = createPageFile("PageWithStreamConfig", tsMorphProject);
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfig.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithGetPathStreamConfig"),
          "utf-8"
        )
      );
    });

    it("does not add template props param if no stream paths in tree", () => {
      const pageFile = createPageFile("EmptyPage", tsMorphProject);
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithNoStreamPathsInTree"),
          "utf-8"
        )
      );
    });

    it("dedupes stream document paths", () => {
      const pageFile = createPageFile(
        "PageWithStreamConfigMultipleFields",
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
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
              metadataUUID: "mock-metadata-uuid",
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
              metadataUUID: "mock-metadata-uuid",
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
              metadataUUID: "mock-metadata-uuid",
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
              metadataUUID: "mock-metadata-uuid",
            },
          ],
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfigMultipleFields.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfigArrayAndObjectField"),
          "utf-8"
        )
      );
    });

    it("gracefully handles imports and streams document usages even in ErrorComponentStates", () => {
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      const pageFile = createPageFile(
        "PageWithErrorComponentState",
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithErrorComponentState.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithErrorComponentState"),
          "utf-8"
        )
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error adding import in test: unable to find metadata for Banner."
      );
    });

    it("preserves 'slug' field for PagesJS PageFile", () => {
      const pageFile = createPageFile(
        "EmptyPageWithStreamConfigSlugField",
        tsMorphProject
      );
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfigSlugField.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithStreamConfigSlugField"),
          "utf-8"
        )
      );
    });

    it("updates stream scope", () => {
      const pageFile = createPageFile("PageWithStreamConfig", tsMorphProject);
      pageFile.updatePageFile(
        {
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
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithStreamConfig.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithModifiedStreamScope"),
          "utf-8"
        )
      );
    });
  });

  describe("getPath", () => {
    it("adds new getPath function when there is none", () => {
      const pageFile = createPageFile("EmptyPage", tsMorphProject);
      pageFile.updatePageFile(
        {
          ...basicPageState,
          pagesJS: {
            getPathValue: { kind: PropValueKind.Literal, value: "index.html" },
          },
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithGetPath"), "utf-8")
      );
    });

    describe("updates existing getPath function", () => {
      it("updates to modified string literal value", () => {
        const pageFile = createPageFile("PageWithGetPath", tsMorphProject);
        pageFile.updatePageFile(
          {
            ...basicPageState,
            pagesJS: {
              getPathValue: {
                kind: PropValueKind.Literal,
                value: "static.html",
              },
            },
          },
          UUIDToFileMetadata
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining("PageWithGetPath.tsx"),
          fs.readFileSync(
            getPagePath("updatePageFile/PageWithModifiedGetPath"),
            "utf-8"
          )
        );
      });

      it("updates to template expression", () => {
        const pageFile = createPageFile("PageWithGetPath", tsMorphProject);
        pageFile.updatePageFile(
          {
            ...basicPageState,
            pagesJS: {
              getPathValue: {
                kind: PropValueKind.Expression,
                value: "`test-${document.slug}`",
              },
            },
          },
          UUIDToFileMetadata
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining("PageWithGetPath.tsx"),
          fs.readFileSync(
            getPagePath("updatePageFile/PageWithTemplateGetPath"),
            "utf-8"
          )
        );
      });

      it("updates to property access expression", () => {
        const pageFile = createPageFile("PageWithGetPath", tsMorphProject);
        pageFile.updatePageFile(
          {
            ...basicPageState,
            pagesJS: {
              getPathValue: {
                kind: PropValueKind.Expression,
                value: "document.slug",
              },
            },
          },
          UUIDToFileMetadata
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining("PageWithGetPath.tsx"),
          fs.readFileSync(
            getPagePath("updatePageFile/PageWithPropertyGetPath"),
            "utf-8"
          )
        );
      });

      it("updates a getPath function without return keyword", () => {
        const pageFile = createPageFile(
          "PageWithNoReturnGetPath",
          tsMorphProject
        );
        pageFile.updatePageFile(
          {
            ...basicPageState,
            pagesJS: {
              getPathValue: {
                kind: PropValueKind.Literal,
                value: "static.html",
              },
            },
          },
          UUIDToFileMetadata
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining("PageWithNoReturnGetPath.tsx"),
          fs.readFileSync(
            getPagePath("updatePageFile/PageWithModifiedNoReturnGetPath"),
            "utf-8"
          )
        );
      });
    });

    it("does not modify getPath if getPathValue is undefined", () => {
      const pageFile = createPageFile("PageWithComplexGetPath", tsMorphProject);
      pageFile.updatePageFile(
        {
          ...basicPageState,
          pagesJS: {
            entityFiles: ["mock-entity-file"],
            getPathValue: undefined,
          },
        },
        UUIDToFileMetadata
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithComplexGetPath.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithComplexGetPath"),
          "utf-8"
        )
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
