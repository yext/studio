import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import {
  getComponentPath,
  getFixturePath,
  getLayoutPath,
} from "../__utils__/getFixturePath";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  LayoutState,
} from "../../src/types";
import { mockUUID } from "../__utils__/spies";
import { assertIsOk } from "../__utils__/asserts";
import { createTestProject } from "../__utils__/createTestSourceFile";
import LayoutFile from "../../src/sourcefiles/LayoutFile";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import ComponentTreeParser from "../../src/parsers/ComponentTreeParser";
import { Ok } from "true-myth/dist/public/result";
import { ParsingError } from "../../src/errors/ParsingError";

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

function createLayoutFile(layoutName: string): LayoutFile {
  const studioSourceFileParser = new StudioSourceFileParser(
    getLayoutPath(layoutName),
    createTestProject()
  );
  const componentTreeParser = new ComponentTreeParser(
    studioSourceFileParser,
    mockGetFileMetadata
  );
  return new LayoutFile(studioSourceFileParser, componentTreeParser);
}

function getLayoutState(layoutName: string): Ok<LayoutState, ParsingError> {
  const layoutFile = createLayoutFile(layoutName);
  const result = layoutFile.getLayoutState();
  assertIsOk(result);
  return result;
}

describe("getLayoutState", () => {
  beforeEach(() => {
    mockUUID();
  });

  it("correctly parses component tree", () => {
    const result = getLayoutState("BasicLayout");
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
    const result = getLayoutState("BasicLayout");
    const expectedIndexCssPath = getFixturePath("LayoutFile/index.css");
    expect(result.value.cssImports).toEqual([
      expectedIndexCssPath,
      expect.stringContaining("/node_modules/@yext/search-ui-react/lib/bundle.css")
    ]);
  });

  it("correctly gets filepath", () => {
    const result = getLayoutState("BasicLayout");
    expect(result.value.filepath).toEqual(getLayoutPath("BasicLayout"));
  });

  describe("errors", () => {
    it("returns an error if an error was thrown while parsing the layout", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const layoutFile = createLayoutFile("ErrorLayout");

      expect(layoutFile.getLayoutState()).toHaveErrorMessage(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
      expect(consoleErrorSpy).toBeCalled();
    });
  });
});
