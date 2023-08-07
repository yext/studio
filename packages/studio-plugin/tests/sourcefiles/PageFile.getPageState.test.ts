import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/ComponentState";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getPagePath } from "../__utils__/getFixturePath";
import { FileMetadata, FileMetadataKind, PropShape } from "../../src/types";
import {
  componentTree,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { mockUUID } from "../__utils__/spies";
import { assertIsOk } from "../__utils__/asserts";

jest.mock("uuid");

function mockGetFileMetadata(filepath: string): FileMetadata {
  let propShape: PropShape = {};
  if (filepath?.includes("ComplexBanner")) {
    propShape = {
      title: { type: PropValueType.string, tooltip: "jsdoc", required: false },
      num: { type: PropValueType.number, required: false },
      bool: { type: PropValueType.boolean, required: false },
      bgColor: { type: PropValueType.HexColor, required: false },
    };
  } else if (filepath?.includes("NestedBanner")) {
    propShape = {};
  } else if (filepath?.includes("Required")) {
    propShape = {
      title: { type: PropValueType.string, tooltip: "jsdoc", required: true },
    };
  }

  return {
    kind: FileMetadataKind.Component,
    metadataUUID: filepath,
    propShape,
    filepath,
  };
}

function createPageFile(pageName: string, isPagesJSRepo = false): PageFile {
  return new PageFile(
    getPagePath(pageName),
    mockGetFileMetadata,
    createTsMorphProject(),
    isPagesJSRepo
  );
}

describe("getPageState", () => {
  beforeEach(() => {
    mockUUID();
  });

  it("correctly parses page with top-level React.Fragment", () => {
    const pageFile = createPageFile("reactFragmentPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses page with top-level Fragment", () => {
    const pageFile = createPageFile("fragmentPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses page with top-level Fragment in short syntax", () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses page with top-level div component and logs warning", () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    const pageFile = createPageFile("divPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toEqual([
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

  it("correctly parses page with repeater", () => {
    const pageFile = createPageFile("repeaterPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.componentTree).toContainEqual({
      kind: ComponentStateKind.Repeater,
      uuid: "mock-uuid-1",
      parentUUID: "mock-uuid-0",
      listExpression: "document.services",
      repeatedComponent: {
        ...componentTree[1],
        uuid: undefined,
        parentUUID: undefined,
      },
    });
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
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
    ]);
  });

  it("correctly gets filepath", () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.filepath).toEqual(
      getPagePath("shortFragmentSyntaxPage")
    );
  });

  it("correctly gets getPathValue", () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage", true);
    const result = pageFile.getPageState();

    assertIsOk(result);
    expect(result.value.pagesJS?.getPathValue).toEqual({
      kind: PropValueKind.Literal,
      value: "index.html",
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

  it("returns empty component tree when parses a page without return statement", () => {
    const pageFile = createPageFile("noReturnStatementPage");
    const result = pageFile.getPageState();
    assertIsOk(result);
    expect(result.value.componentTree).toEqual([]);
  });

  it("gracefully handles missing props", () => {
    const pageFile = createPageFile("missingRequiredPropPage");
    const result = pageFile.getPageState();
    assertIsOk(result);
    expect(result.value.componentTree).toHaveLength(1);
    expect(result.value.componentTree[0].kind).toEqual(
      ComponentStateKind.Error
    );
  });

  describe("throws errors", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation();
    });

    it("throws an error when the return statement has no top-level Jsx node", () => {
      const pageFile = createPageFile("noTopLevelJsxPage");

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

    it("throws an error when a non-map JsxExpression is found on the page", () => {
      const pageFile = createPageFile("jsxExpressionPage");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use' +
          " in page files except for `map` function expressions."
      );
    });

    it("throws an error when a Repeater tries to repeat a built-in component", () => {
      const pageFile = createPageFile("builtInRepeaterPage");

      expect(pageFile.getPageState()).toHaveErrorMessage(
        "Error parsing map expression: repetition of built-in components is not supported."
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
