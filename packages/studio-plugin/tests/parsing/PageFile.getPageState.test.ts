import PageFile from "../../src/parsing/PageFile";
import { ComponentStateKind } from "../../src/types/State";
import { PropValueType } from "../../src/types/PropValues";
import { getPagePath } from "../__utils__/getFixturePath";
import * as uuidUtils from "uuid";
import { FileMetadata, FileMetadataKind, PropShape } from "../../src";
import {
  componentTree,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import createTsMorphProject from "../../src/parsing/createTsMorphProject";

jest.mock("uuid");

function mockGetFileMetadata(filepath: string): FileMetadata {
  let propShape: PropShape = {};
  if (filepath?.includes("ComplexBanner")) {
    propShape = {
      title: { type: PropValueType.string, doc: "jsdoc" },
      num: { type: PropValueType.number },
      bool: { type: PropValueType.boolean },
      bgColor: { type: PropValueType.HexColor },
    };
  } else if (filepath?.includes("NestedBanner")) {
    propShape = {};
  }

  return {
    kind: FileMetadataKind.Component,
    metadataUUID: filepath,
    propShape,
    filepath,
  };
}

function createPageFile(pageName: string) {
  return new PageFile(
    getPagePath(pageName),
    mockGetFileMetadata,
    createTsMorphProject()
  );
}

describe("getPageState", () => {
  beforeEach(() => {
    let uuidCount = 0;
    jest.spyOn(uuidUtils, "v4").mockImplementation(() => {
      return `mock-uuid-${uuidCount++}`;
    });
  });

  it("correctly parses page with top-level React.Fragment", () => {
    const pageFile = createPageFile("reactFragmentPage");
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level Fragment", () => {
    const pageFile = createPageFile("fragmentPage");
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level Fragment in short syntax", () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level div component and logs warning", () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    const pageFile = createPageFile("divPage");
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      {
        kind: ComponentStateKind.BuiltIn,
        componentName: "div",
        props: {},
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

    expect(result.componentTree).toEqual(nestedBannerComponentTree);
  });

  it("correctly parses page with variable statement and no parentheses around return statement", () => {
    const pageFile = createPageFile("noReturnParenthesesPage");
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      fragmentComponent,
      {
        ...componentTree[1],
        uuid: "mock-uuid-1",
      },
    ]);
  });

  it("correctly parses CSS imports", () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = pageFile.getPageState();

    expect(result.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
    ]);
  });

  describe("throws errors", () => {
    it("throws an error when no return statement is found in the default export", () => {
      const pageFile = createPageFile("noReturnStatementPage");

      expect(() => pageFile.getPageState()).toThrowError(
        /^No return statement found for the default export at path: /
      );
    });

    it("throws an error when the return statement has no top-level Jsx node", () => {
      const pageFile = createPageFile("noTopLevelJsxPage");

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
    });

    it("throws an error when a JsxSpreadAttribute is found on the page", () => {
      const pageFile = createPageFile("jsxSpreadAttributePage");

      expect(() => pageFile.getPageState()).toThrowError(
        "Error parsing `{...props}`: JsxSpreadAttribute is not currently supported."
      );
    });

    it("throws an error when JsxText is found on the page", () => {
      const pageFile = createPageFile("jsxTextPage");

      expect(() => pageFile.getPageState()).toThrowError(
        'Found JsxText with content "\n      Text\n      ". JsxText is not currently supported.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", () => {
      const pageFile = createPageFile("jsxExpressionPage");

      expect(() => pageFile.getPageState()).toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", () => {
      const pageFile = createPageFile("jsxExpressionPage");

      expect(() => pageFile.getPageState()).toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });

    it("throws when an ObjectLiteralExpression is returned by the page", () => {
      const pageFile = createPageFile("returnsObject");

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });

    it("throws when an ArrayLiteralExpression is returned by the page", () => {
      const pageFile = createPageFile("returnsArray");

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });
  });
});
