import ComponentTreeParser from "../../src/parsers/ComponentTreeParser";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PropShape,
  PropValueType,
} from "../../src/types";
import {
  componentTree,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import { createTestProject } from "../__utils__/createTestSourceFile";
import { getFixturePath } from "../__utils__/getFixturePath";
import { mockUUID } from "../__utils__/spies";

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
    cssImports: [],
  };
}

describe("parseComponentTree", () => {
  beforeEach(() => {
    mockUUID();
  });

  it("correctly parses file with top-level React.Fragment", () => {
    expect(parseComponentTree("containerReactFragment")).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses file with top-level Fragment", () => {
    expect(parseComponentTree("containerFragment")).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses file with top-level Fragment in short syntax", () => {
    expect(parseComponentTree("containerShortFragmentSyntax")).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses file with top-level div component and logs warning", () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    expect(parseComponentTree("containerDiv")).toEqual([
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

  it("correctly parses file with nested banner components", () => {
    expect(parseComponentTree("nestedBanner")).toEqual(
      nestedBannerComponentTree
    );
  });

  it("correctly parses file with variable statement and no parentheses around return statement", () => {
    expect(parseComponentTree("noReturnParentheses")).toEqual([
      fragmentComponent,
      {
        ...componentTree[1],
        uuid: "mock-uuid-1",
      },
    ]);
  });

  it("returns empty component tree when parses a file without return statement", () => {
    expect(parseComponentTree("noReturnStatement")).toEqual([]);
  });

  it("gracefully handles missing props", () => {
    const parsedComponentTree = parseComponentTree("missingRequiredProp");
    expect(parsedComponentTree).toHaveLength(1);
    expect(parsedComponentTree[0].kind).toEqual(ComponentStateKind.Error);
  });

  describe("throws errors", () => {
    it("throws an error when a JsxExpression is found", () => {
      expect(() => parseComponentTree("jsxExpression")).toThrowError(
        /^Jsx nodes of kind "JsxExpression" are not supported for direct use/
      );
    });

    it("throws an error when a JsxSpreadAttribute is found", () => {
      expect(() => parseComponentTree("jsxSpreadAttribute")).toThrowError(
        "Error parsing `{...props}`: JsxSpreadAttribute is not currently supported."
      );
    });

    it("throws an error when JsxText is found", () => {
      expect(() => parseComponentTree("jsxText")).toThrowError(
        'Found JsxText with content "Text". JsxText is not currently supported.'
      );
    });

    it("throws an error when the return statement has no top-level Jsx node", () => {
      expect(() => parseComponentTree("noTopLevelJsx")).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
    });

    it("throws when an ArrayLiteralExpression is returned", () => {
      expect(() => parseComponentTree("returnsArray")).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });

    it("throws when an ObjectLiteralExpression is returned", () => {
      expect(() => parseComponentTree("returnsObject")).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });
  });
});

function parseComponentTree(fileName: string) {
  const filepath = getFixturePath(`ComponentTreeParser/${fileName}.tsx`);
  const project = createTestProject();
  project.addSourceFileAtPath(filepath);
  const sourceFileParser = new StudioSourceFileParser(filepath, project);
  const componentTreeParser = new ComponentTreeParser(
    sourceFileParser,
    mockGetFileMetadata
  );
  const defaultImports = sourceFileParser.getAbsPathDefaultImports();
  return componentTreeParser.parseComponentTree(defaultImports);
}
