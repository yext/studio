import path from "path";
import ComponentFile from "../../src/parsing/ComponentFile";

describe("getComponentMetadtata", () => {
  it("can parse a simple Banner component", () => {
    const pathToComponent = getComponentPath("SimpleBanner");
    const componentFile = new ComponentFile(pathToComponent);
    expect(componentFile.getComponentMetadata()).toEqual({
      kind: "componentMetadata",
      propShape: { title: { type: "string" } },
    });
  });

  it("can parse a Banner component that accepts props.children", () => {
    const pathToComponent = getComponentPath("NestedBanner");
    const componentFile = new ComponentFile(pathToComponent);
    expect(componentFile.getComponentMetadata()).toEqual({
      kind: "componentMetadata",
      propShape: {},
      acceptsChildren: true,
    });
  });

  it("can parse a more complex Banner with docs, prop types imported from Studio, and initialprops", () => {
    const pathToComponent = getComponentPath("ComplexBanner");
    const componentFile = new ComponentFile(pathToComponent);
    expect(componentFile.getComponentMetadata()).toEqual({
      kind: "componentMetadata",
      propShape: {
        title: { type: "string", doc: "jsdoc" },
        num: { type: "number" },
        bool: { type: "boolean" },
        bgColor: { type: "HexColor" },
      },
      initialProps: {
        bgColor: { kind: "literal", valueType: "HexColor", value: "#abcdef" },
        bool: {
          kind: "literal",
          valueType: "boolean",
          value: false,
        },
        num: {
          kind: "literal",
          valueType: "number",
          value: 5,
        },
        title: {
          kind: "expression",
          valueType: "string",
          value: "INITIAL_TITLE",
        },
      },
    });
  });

  it("Throws an Error when an import for HexColor is missing", () => {
    const pathToComponent = getComponentPath("MissingImportBanner");
    const componentFile = new ComponentFile(pathToComponent);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Missing import from/
    );
  });

  it("Throws an Error when an an unrecognized prop type is encountered", () => {
    const pathToComponent = getComponentPath("UnrecognizedPropBanner");
    const componentFile = new ComponentFile(pathToComponent);
    expect(() => componentFile.getComponentMetadata()).toThrowError(
      /^Unrecognized prop type/
    );
  });
});

function getComponentPath(componentName: string) {
  return path.resolve(
    __dirname,
    `../__fixtures__/ComponentFile/${componentName}.tsx`
  );
}
