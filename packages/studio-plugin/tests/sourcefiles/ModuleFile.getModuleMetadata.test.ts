import { getModulePath } from "../__utils__/getFixturePath";
import {
  ComponentStateKind,
  ModuleMetadata,
  PropValueKind,
  PropValueType,
  PropShape,
  FileMetadataKind,
} from "../../src/types";
import { mockUUID } from "../__utils__/spies";
import { GetFileMetadata } from "../../src/parsers/ComponentTreeParser";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import ModuleFile from "../../src/sourcefiles/ModuleFile";
import { assertIsOk } from "../__utils__/asserts";
import createTestSourceFile from "../__utils__/createTestSourceFile";
import upath from "upath";

jest.mock("uuid");

const mockGetFileMetadata: GetFileMetadata = (filepath: string) => {
  let propShape: PropShape = {};
  if (filepath?.endsWith("Card.tsx")) {
    propShape = {
      text: { type: PropValueType.string, required: false },
    };
  } else if (filepath?.endsWith("Tile.tsx")) {
    propShape = {
      label: { type: PropValueType.string, required: false },
    };
  }
  return {
    kind: filepath?.includes("components" + upath.sep)
      ? FileMetadataKind.Component
      : FileMetadataKind.Module,
    metadataUUID: "mock-metadata-uuid",
    propShape,
    filepath,
    componentTree: [],
  };
};

describe("getModuleMetadata", () => {
  const project = createTsMorphProject();
  beforeEach(() => {
    mockUUID();
  });

  it("can parse a Module comprised of Component type", () => {
    const pathToModule = getModulePath("PanelWithComponents");
    const moduleFile = new ModuleFile(
      pathToModule,
      mockGetFileMetadata,
      project
    );
    const result = moduleFile.getModuleMetadata();
    assertIsOk(result);
    const moduleMetadata = result.value;

    const expectedModuleMetadata: ModuleMetadata = {
      filepath: expect.stringContaining(
        upath.join("ModuleFile", "PanelWithComponents.tsx")
      ),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Module,
      propShape: {
        topLevelCardText: {
          type: PropValueType.string,
          required: false,
        },
      },
      initialProps: {
        topLevelCardText: {
          kind: PropValueKind.Literal,
          value: "top level card",
          valueType: PropValueType.string,
        },
      },
      componentTree: [
        {
          componentName: "Card",
          kind: ComponentStateKind.Standard,
          uuid: "mock-uuid-0",
          parentUUID: undefined,
          metadataUUID: "mock-metadata-uuid",
          props: {
            text: {
              kind: PropValueKind.Expression,
              value: "topLevelCardText",
              valueType: PropValueType.string,
            },
          },
        },
        {
          componentName: "Banner",
          kind: ComponentStateKind.Standard,
          uuid: "mock-uuid-1",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
          props: {},
        },
        {
          componentName: "Card",
          kind: ComponentStateKind.Standard,
          uuid: "mock-uuid-2",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
          props: {
            text: {
              kind: PropValueKind.Literal,
              value: "internal card",
              valueType: PropValueType.string,
            },
          },
        },
      ],
    };
    expect(moduleMetadata).toEqual(expectedModuleMetadata);
  });

  it("can parse a Module comprised of Module type", () => {
    const pathToModule = getModulePath("PanelWithModules");
    const moduleFile = new ModuleFile(
      pathToModule,
      mockGetFileMetadata,
      project
    );
    const result = moduleFile.getModuleMetadata();
    assertIsOk(result);
    const moduleMetadata = result.value;

    const expectedModuleMetadata: ModuleMetadata = {
      filepath: expect.stringContaining(
        upath.join("ModuleFile", "PanelWithModules.tsx")
      ),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Module,
      propShape: {
        topTileLabel: {
          type: PropValueType.string,
          required: false,
        },
      },
      componentTree: [
        {
          kind: ComponentStateKind.Fragment,
          uuid: "mock-uuid-0",
          parentUUID: undefined,
        },
        {
          componentName: "Tile",
          kind: ComponentStateKind.Module,
          uuid: "mock-uuid-1",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
          props: {
            label: {
              kind: PropValueKind.Expression,
              value: "topTileLabel",
              valueType: PropValueType.string,
            },
          },
        },
        {
          componentName: "Tile",
          kind: ComponentStateKind.Module,
          uuid: "mock-uuid-2",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
          props: {
            label: {
              kind: PropValueKind.Literal,
              value: "bottom tile label",
              valueType: PropValueType.string,
            },
          },
        },
      ],
    };
    expect(moduleMetadata).toEqual(expectedModuleMetadata);
  });

  it("can parse a Module comprised of Component type and Module type", () => {
    const pathToModule = getModulePath("PanelWithComponentAndModule");
    const moduleFile = new ModuleFile(
      pathToModule,
      mockGetFileMetadata,
      project
    );
    const result = moduleFile.getModuleMetadata();
    assertIsOk(result);
    const moduleMetadata = result.value;

    const expectedModuleMetadata: ModuleMetadata = {
      kind: FileMetadataKind.Module,
      filepath: expect.stringContaining(
        upath.join("ModuleFile", "PanelWithComponentAndModule.tsx")
      ),
      metadataUUID: expect.any(String),
      propShape: {
        cardText: {
          type: PropValueType.string,
          required: false,
        },
      },
      componentTree: [
        {
          kind: ComponentStateKind.Fragment,
          uuid: "mock-uuid-0",
          parentUUID: undefined,
        },
        {
          componentName: "Card",
          kind: ComponentStateKind.Standard,
          uuid: "mock-uuid-1",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
          props: {
            text: {
              kind: PropValueKind.Expression,
              value: "cardText",
              valueType: PropValueType.string,
            },
          },
        },
        {
          componentName: "Tile",
          kind: ComponentStateKind.Module,
          uuid: "mock-uuid-2",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
          props: {
            label: {
              kind: PropValueKind.Literal,
              value: "tile label",
              valueType: PropValueType.string,
            },
          },
        },
      ],
    };
    expect(moduleMetadata).toEqual(expectedModuleMetadata);
  });
});

describe("error cases", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation();
  });

  it("errors when the module only returns null", () => {
    const { project } = createTestSourceFile(
      `export default function Module() { return null };`
    );
    const moduleFile = new ModuleFile("test.tsx", mockGetFileMetadata, project);
    const result = moduleFile.getModuleMetadata();
    expect(result).toHaveErrorMessage(/^Unable to find top-level JSX element/);
  });

  it("errors when the prop interface is invalid", () => {
    const { project } = createTestSourceFile(
      `type Props = string; export default function Module(props: Props) { return <div></div> };`
    );
    const moduleFile = new ModuleFile("test.tsx", mockGetFileMetadata, project);
    const result = moduleFile.getModuleMetadata();
    expect(result).toHaveErrorMessage("Error parsing Props: Expected object.");
  });
});
