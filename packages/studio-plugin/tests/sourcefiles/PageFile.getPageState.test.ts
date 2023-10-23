import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/ComponentState";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import {
  getComponentPath,
  getFixturePath,
  getPagePath,
} from "../__utils__/getFixturePath";
import { FileMetadata, FileMetadataKind } from "../../src/types";
import { mockUUID } from "../__utils__/spies";
import { assertIsOk } from "../__utils__/asserts";
import { createTestProject } from "../__utils__/createTestSourceFile";

jest.mock("uuid");

function mockGetFileMetadata(filepath: string): FileMetadata {
  return {
    kind: FileMetadataKind.Component,
    metadataUUID: filepath,
    propShape: {
      title: { type: PropValueType.string, tooltip: "jsdoc", required: false },
      num: { type: PropValueType.number, required: false },
      bool: { type: PropValueType.boolean, required: false },
    },
    filepath,
    cssImports: [],
  };
}

function createPageFile(pageName: string, isPagesJSRepo = false): PageFile {
  return new PageFile(
    getPagePath(pageName),
    mockGetFileMetadata,
    createTestProject(),
    isPagesJSRepo
  );
}

describe("getPageState", () => {
  beforeEach(() => {
    mockUUID();
  });

  it("correctly parses component tree", () => {
    const pageFile = createPageFile("entityTemplate");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual([
      {
        kind: ComponentStateKind.Standard,
        componentName: "ComplexBanner",
        props: {
          bool: {
            kind: PropValueKind.Literal,
            value: false,
            valueType: PropValueType.boolean,
          },
          num: {
            kind: PropValueKind.Literal,
            value: 3,
            valueType: PropValueType.number,
          },
          title: {
            kind: PropValueKind.Expression,
            value: "document.title",
            valueType: PropValueType.string,
          },
        },
        uuid: "mock-uuid-0",
        metadataUUID: getComponentPath("ComplexBanner"),
      },
    ]);
  });

  it("correctly parses CSS imports", () => {
    const pageFile = createPageFile("entityTemplate");
    const result = pageFile.getPageState();

    assertIsOk(result);
    const expectedIndexCssPath = getFixturePath("PageFile/index.css");
    expect(result.value.cssImports).toEqual([
      expectedIndexCssPath,
      expect.stringContaining("/node_modules/@yext/search-ui-react/lib/bundle.css")
    ]);
  });

  it("correctly gets filepath", () => {
    const pageFile = createPageFile("entityTemplate");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.filepath).toEqual(getPagePath("entityTemplate"));
  });

  it("correctly gets getPathValue", () => {
    const pageFile = createPageFile("entityTemplate", true);
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.pagesJS?.getPathValue).toEqual({
      kind: PropValueKind.Expression,
      value: "document.slug",
    });
  });

  it("correctly gets stream scope", () => {
    const pageFile = createPageFile("entityTemplate", true);
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.pagesJS?.streamScope).toEqual({
      entityTypes: ["location"],
    });
  });

  describe("errors", () => {
    it("returns an error if an error was thrown while parsing the page", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const pageFile = createPageFile("errorPage");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it("cannot resolve node_module CSS import using package.json export alias", () => {
      const pageFile = createPageFile("brokenCssImport");
  
      expect(pageFile.getPageState()).toHaveErrorMessage(
        /^@yext\/search-ui-react\/bundle.css could not be resolved /
      );
    });
  });
});
