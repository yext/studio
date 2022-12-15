import PageFile from "../../src/files/PageFile";
import { ComponentStateKind } from "../../src/types/State";
import { PropValueType } from "../../src/types/PropValues";
import { getPagePath } from "../__utils__/getFixturePath";
import * as getFileMetadataUtils from "../../src/getFileMetadata";
import * as uuidUtils from "uuid";
import { FileMetadataKind, PropShape } from "../../src";
import {
  componentTree,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";

jest.mock("uuid");

describe("getPageState", () => {
  beforeEach(() => {
    let uuidCount = 0;
    jest.spyOn(uuidUtils, "v4").mockImplementation(() => {
      return `mock-uuid-${uuidCount++}`;
    });
    jest
      .spyOn(getFileMetadataUtils, "getFileMetadata")
      .mockImplementation((filepath) => {
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
        };
      });
  });

  it("correctly parses page with top-level React.Fragment", () => {
    const pageFile = new PageFile(getPagePath("reactFragmentPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level Fragment", () => {
    const pageFile = new PageFile(getPagePath("fragmentPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level Fragment in short syntax", () => {
    const pageFile = new PageFile(getPagePath("shortFragmentSyntaxPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level div component and logs warning", () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    const pageFile = new PageFile(getPagePath("divPage"));
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
    const pageFile = new PageFile(getPagePath("nestedBannerPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual(nestedBannerComponentTree);
  });

  it("correctly parses page with variable statement and no parentheses around return statement", () => {
    const pageFile = new PageFile(getPagePath("noReturnParenthesesPage"));
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
    const pageFile = new PageFile(getPagePath("shortFragmentSyntaxPage"));
    const result = pageFile.getPageState();

    expect(result.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
    ]);
  });

  describe("throws errors", () => {
    it("throws an error when no return statement is found in the default export", () => {
      const pageFile = new PageFile(getPagePath("noReturnStatementPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        /^No return statement found for the default export at path: /
      );
    });

    it("throws an error when the return statement has no top-level Jsx node", () => {
      const pageFile = new PageFile(getPagePath("noTopLevelJsxPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
    });

    it("throws an error when a JsxSpreadAttribute is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxSpreadAttributePage"));

      expect(() => pageFile.getPageState()).toThrowError(
        "Error parsing `{...props}`: JsxSpreadAttribute is not currently supported."
      );
    });

    it("throws an error when JsxText is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxTextPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        'Found JsxText with content "\n      Text\n      ". JsxText is not currently supported.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxExpressionPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxExpressionPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });

    it("throws when an ObjectLiteralExpression is returned by the page", () => {
      const pageFile = new PageFile(getPagePath("returnsObject"));

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });

    it("throws when an ArrayLiteralExpression is returned by the page", () => {
      const pageFile = new PageFile(getPagePath("returnsArray"));

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });
  });
});
