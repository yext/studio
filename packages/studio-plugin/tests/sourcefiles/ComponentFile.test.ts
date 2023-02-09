import ComponentFile from "../../src/sourcefiles/ComponentFile";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { getComponentPath } from "../__utils__/getFixturePath";
import {
  ComponentMetadata,
  FileMetadataKind,
  PropValueKind,
  PropValueType,
} from "../../src/index-cjs";

describe("getComponentMetadata", () => {
  const project = createTsMorphProject();

  it("can parse a simple Banner component", () => {
    const pathToComponent = getComponentPath("SimpleBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(componentFile.getComponentMetadata()).toEqual({
      filepath: expect.stringContaining("ComponentFile/SimpleBanner.tsx"),
      metadataUUID: expect.any(String),
      kind: "componentMetadata",
      propShape: { title: { type: "string" } },
    });
  });

  it("can parse a Banner component that accepts props.children", () => {
    const pathToComponent = getComponentPath("NestedBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(componentFile.getComponentMetadata()).toEqual({
      filepath: expect.stringContaining("ComponentFile/NestedBanner.tsx"),
      metadataUUID: expect.any(String),
      kind: "componentMetadata",
      propShape: {},
      acceptsChildren: true,
    });
  });

  it("can parse a more complex Banner with docs, prop types imported from Studio, and initialprops", () => {
    const pathToComponent = getComponentPath("ComplexBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    const expectedComponentMetadata: ComponentMetadata = {
      filepath: expect.stringContaining("ComponentFile/ComplexBanner.tsx"),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Component,
      propShape: {
        title: { type: PropValueType.string, doc: "jsdoc" },
        num: { type: PropValueType.number },
        bool: { type: PropValueType.boolean },
        bgColor: { type: PropValueType.HexColor },
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
      },
    };
    expect(componentFile.getComponentMetadata()).toEqual(
      expectedComponentMetadata
    );
  });

  it("Throws an Error when an import for HexColor is missing", () => {
    const pathToComponent = getComponentPath("MissingImportBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Missing import from/
    );
  });

  it("Throws an Error when an Expression is used within initialProps", () => {
    const pathToComponent = getComponentPath("ExpressionInitialBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Expressions are not supported within object literal/
    );
  });

  it("Throws an Error when an an unrecognized prop type is encountered", () => {
    const pathToComponent = getComponentPath("UnrecognizedPropBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Unrecognized type/
    );
  });
});
