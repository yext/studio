import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getComponentPath, getLayoutPath } from "../__utils__/getFixturePath";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
} from "../../src/types";
import { mockUUID } from "../__utils__/spies";
import { assertIsOk } from "../__utils__/asserts";
import { createTestProject } from "../__utils__/createTestSourceFile";
import LayoutFile from "../../src/sourcefiles/LayoutFile";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import ComponentTreeParser from "../../src/parsers/ComponentTreeParser";

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

describe("getLayoutMetadata", () => {
  beforeEach(() => {
    mockUUID();
  });

  it("correctly parses component tree", () => {
    const layoutFile = createLayoutFile("BasicLayout");
    const result = layoutFile.getLayoutMetadata();

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
    const layoutFile = createLayoutFile("BasicLayout");
    const result = layoutFile.getLayoutMetadata();

    assertIsOk(result);
    expect(result.value.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
    ]);
  });

  it("correctly gets filepath", () => {
    const layoutFile = createLayoutFile("BasicLayout");
    const result = layoutFile.getLayoutMetadata();

    assertIsOk(result);
    expect(result.value.filepath).toEqual(getLayoutPath("BasicLayout"));
  });

  describe("errors", () => {
    it("returns an error if an error was thrown while parsing the layout", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const layoutFile = createLayoutFile("ErrorLayout");

      expect(layoutFile.getLayoutMetadata()).toHaveErrorMessage(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
      expect(consoleErrorSpy).toBeCalled();
    });
  });
});
