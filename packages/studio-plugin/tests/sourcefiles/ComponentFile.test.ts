import ComponentFile from "../../src/sourcefiles/ComponentFile";
import { getComponentPath } from "../__utils__/getFixturePath";
import {
  ComponentMetadata,
  FileMetadataKind,
  PropValueKind,
  PropValueType,
} from "../../src/types";
import { assertIsOk } from "../__utils__/asserts";
import upath from "upath";
import { createTestProject } from "../__utils__/createTestSourceFile";
import dependencyTree from "dependency-tree";

describe("getComponentMetadata", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation();
  });
  const project = createTestProject();

  function makeComponentFileWithDependencyTree(componentName: string) {
    const pathToComponent = getComponentPath(componentName);
    const componentDependencyTree = dependencyTree({
      filename: pathToComponent,
      directory: upath.dirname(pathToComponent),
    });

    const componentFile = new ComponentFile(
      pathToComponent,
      project,
      componentDependencyTree
    );
    return componentFile;
  }

  it("can parse a simple Banner component", () => {
    const pathToComponent = getComponentPath("SimpleBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value).toEqual({
      filepath: expect.stringContaining(
        upath.join("ComponentFile", "SimpleBanner.tsx")
      ),
      metadataUUID: expect.any(String),
      kind: "componentMetadata",
      propShape: { title: { type: "string", required: false } },
      cssImports: [],
    });
  });

  it("can parse a Banner component that accepts props.children", () => {
    const pathToComponent = getComponentPath("NestedBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value).toEqual({
      filepath: expect.stringContaining(
        upath.join("ComponentFile", "NestedBanner.tsx")
      ),
      metadataUUID: expect.any(String),
      kind: "componentMetadata",
      propShape: {},
      acceptsChildren: true,
      cssImports: [],
    });
  });

  it("can parse a more complex Banner with tooltip, display name, imported prop types, and initialprops (but not external JSDocs)", () => {
    const pathToComponent = getComponentPath("ComplexBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    const expectedComponentMetadata: ComponentMetadata = {
      filepath: expect.stringContaining(
        upath.join("ComponentFile", "ComplexBanner.tsx")
      ),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Component,
      propShape: {
        title: {
          type: PropValueType.string,
          tooltip: "jsdoc",
          displayName: "Display Title",
          required: false,
        },
        num: { type: PropValueType.number, required: false },
        bool: { type: PropValueType.boolean, required: false },
        bgColor: { type: PropValueType.HexColor, required: false },
        cta: {
          type: PropValueType.Object,
          required: false,
          shape: {
            link: {
              type: PropValueType.string,
              required: true,
            },
            label: {
              type: PropValueType.string,
              required: true,
            },
            linkType: {
              type: PropValueType.string,
              required: true,
            },
          },
        },
        colorArr: {
          type: PropValueType.Array,
          required: false,
          tooltip: "array",
          itemType: { type: PropValueType.HexColor },
        },
      },
      initialProps: {
        bgColor: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.HexColor,
          value: "#abcdef",
        },
        bool: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: false,
        },
        num: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.number,
          value: 5,
        },
        title: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.string,
          value: "initial title",
        },
        cta: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            link: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.string,
              value: "LINK",
            },
            label: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.string,
              value: "LABEL",
            },
            linkType: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.string,
              value: "LINKTYPE",
            },
          },
        },
        colorArr: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Array,
          value: [
            {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#abcdef",
            },
            {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#ffffff",
            },
          ],
        },
      },
      cssImports: [],
    };
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value).toEqual(expectedComponentMetadata);
  });

  it("correctly parses a string literal type", () => {
    const pathToComponent = getComponentPath("StringLiteralBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value.propShape).toEqual({
      title: {
        type: "string",
        unionValues: ["number"],
        required: false,
      },
    });
  });

  it("can parse a type that shares the same name as a Studio type", () => {
    const pathToComponent = getComponentPath("StudioTypeNameBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value.propShape).toEqual({
      bgColor: {
        type: "string",
        required: true,
      },
    });
  });

  it("Throws an Error if HexColor is not imported from Studio", () => {
    const pathToComponent = getComponentPath("NonStudioImportBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    expect(componentFile.getComponentMetadata()).toHaveErrorMessage(
      "Prop type HexColor is invalid because it is not imported from @yext/studio"
    );
  });

  it("Throws an Error if imported prop interface is missing HexColor import", () => {
    const pathToComponent = getComponentPath("MissingExternalImportBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    expect(componentFile.getComponentMetadata()).toHaveErrorMessage(
      "Prop type HexColor is invalid because it is not imported from @yext/studio"
    );
  });

  it("Throws an Error when an import is missing", () => {
    const pathToComponent = getComponentPath("MissingImportBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    expect(componentFile.getComponentMetadata()).toHaveErrorMessage(
      /^Missing import statement\(s\) in MissingImportBanner.tsx/
    );
  });

  it("Throws an Error when an Expression is used within initialProps", () => {
    const pathToComponent = getComponentPath("ExpressionInitialBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    expect(componentFile.getComponentMetadata()).toHaveErrorMessage(
      /^Expressions are not supported within object literal/
    );
  });

  it("Throws an Error when an unrecognized prop type is encountered", () => {
    const pathToComponent = getComponentPath("UnrecognizedPropBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    expect(componentFile.getComponentMetadata()).toHaveErrorMessage(
      /^Unrecognized type/
    );
  });

  it("Throws an Error when type of props is primitive", () => {
    const pathToComponent = getComponentPath("PrimitivePropsBanner");
    const componentFile = new ComponentFile(pathToComponent, project, {});
    expect(componentFile.getComponentMetadata()).toHaveErrorMessage(
      "Error parsing PrimitiveProps: Expected object."
    );
  });

  it("Can properly parse its dependency tree for CSS files.", () => {
    const componentFile = makeComponentFileWithDependencyTree("ComplexBanner");
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value).toHaveProperty("cssImports", [
      expect.stringContaining("index.css"),
    ]);
  });

  it("Can properly parse transitively imported CSS files.", () => {
    const componentFile = makeComponentFileWithDependencyTree(
      "TransitiveCssComponent"
    );
    const result = componentFile.getComponentMetadata();
    assertIsOk(result);
    expect(result.value).toHaveProperty("cssImports", [
      expect.stringContaining("index.css"),
    ]);
  });
});
