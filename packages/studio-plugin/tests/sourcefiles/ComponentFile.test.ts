import ComponentFile from "../../src/sourcefiles/ComponentFile";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { getComponentPath } from "../__utils__/getFixturePath";
import {
  ComponentMetadata,
  FileMetadataKind,
  PropValueKind,
  PropValueType,
} from "../../src/types";

describe("getComponentMetadata", () => {
  const project = createTsMorphProject();

  it("can parse a simple Banner component", () => {
    const pathToComponent = getComponentPath("SimpleBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(componentFile.getComponentMetadata()).toEqual({
      filepath: expect.stringContaining("ComponentFile/SimpleBanner.tsx"),
      metadataUUID: expect.any(String),
      kind: "componentMetadata",
      propShape: { title: { type: "string", required: false } },
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

  it("can parse a more complex Banner with docs, imported prop types, and initialprops", () => {
    const pathToComponent = getComponentPath("ComplexBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    const expectedComponentMetadata: ComponentMetadata = {
      filepath: expect.stringContaining("ComponentFile/ComplexBanner.tsx"),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Component,
      propShape: {
        title: { type: PropValueType.string, doc: "jsdoc", required: false },
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
              doc: "The CTA link source.",
            },
            label: {
              type: PropValueType.string,
              required: true,
              doc: "The display label for the CTA element.",
            },
            linkType: {
              type: PropValueType.string,
              required: true,
              doc: "The CTA link type (e.g. URL, Phone, Email, Other).",
            },
          },
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

  it("Throws an Error when an unrecognized prop type is encountered", () => {
    const pathToComponent = getComponentPath("UnrecognizedPropBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Could not parse TypeReference "GleebGlarble420PowerRangersChainsawManRaven/
    );
  });

  it("Throws an Error when type of props is primitive", () => {
    const pathToComponent = getComponentPath("PrimitivePropsBanner");
    const componentFile = new ComponentFile(pathToComponent, project);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Expected a ParsedTypeKind.Object for "PrimitiveProps"/
    );
  });
});
