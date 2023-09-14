import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/ComponentState";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getPagePath } from "../__utils__/getFixturePath";
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
      },
      ...componentTree,
    ]);

    expect(consoleWarnSpy).toBeCalledWith(
      "Props for builtIn element: 'div' are currently not supported."
    );
  });

  it("correctly parses page with nested banner components", () => {
    const pageFile = createPageFile("nestedBannerPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual(nestedBannerComponentTree);
  });

  it("correctly parses page with variable statement and no parentheses around return statement", () => {
    const pageFile = createPageFile("noReturnParenthesesPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual([
      fragmentComponent,
      {
        ...componentTree[1],
        uuid: "mock-uuid-1",
      },
    ]);
  });

  it("correctly parses CSS imports", () => {
    const pageFile = createPageFile("entityTemplate");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
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
    });

    it("throws an error when a JsxSpreadAttribute is found on the page", () => {
      const pageFile = createPageFile("jsxSpreadAttributePage");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        "Error parsing `{...props}`: JsxSpreadAttribute is not currently supported."
      );
    });

    it("throws an error when JsxText is found on the page", () => {
      const pageFile = createPageFile("jsxTextPage");
      expect(pageFile.getPageState()).toHaveErrorMessage(
        'Found JsxText with content "Text". JsxText is not currently supported.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", () => {
      const pageFile = createPageFile("jsxExpressionPage");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use' +
          " in page files."
      );
    });

    it("throws when an ObjectLiteralExpression is returned by the page", () => {
      const pageFile = createPageFile("returnsObject");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });

    it("throws when an ArrayLiteralExpression is returned by the page", () => {
      const pageFile = createPageFile("returnsArray");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });
  });
});
