import { getModulePath } from "../__utils__/getFixturePath";
import {
  ComponentStateKind,
  ModuleMetadata,
  PropValueKind,
  PropValueType,
  PropShape,
  FileMetadataKind,
} from "../../src";
import { mockUUID } from "../__utils__/spies";
import { GetFileMetadata } from "../../src/parsers/ComponentTreeParser";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import ModuleFile from "../../src/sourcefiles/ModuleFile";

jest.mock("uuid");

const mockGetFileMetadata: GetFileMetadata = (filepath: string) => {
  let propShape: PropShape = {};
  if (filepath?.endsWith("Card.tsx")) {
    propShape = {
      text: { type: PropValueType.string },
    };
  } else if (filepath?.endsWith("Tile.tsx")) {
    propShape = {
      label: { type: PropValueType.string },
    };
  }
  return {
    kind: filepath?.includes("components/")
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
      jest.fn(),
      project
    );
    const moduleMetadata = moduleFile.getModuleMetadata();

    const expectedModuleMetadata: ModuleMetadata = {
      filepath: expect.stringContaining("ModuleFile/PanelWithComponents.tsx"),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Module,
      propShape: {
        topLevelCardText: {
          type: PropValueType.string,
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
      jest.fn(),
      project
    );
    const moduleMetadata = moduleFile.getModuleMetadata();

    const expectedModuleMetadata: ModuleMetadata = {
      filepath: expect.stringContaining("ModuleFile/PanelWithModules.tsx"),
      metadataUUID: expect.any(String),
      kind: FileMetadataKind.Module,
      propShape: {
        topTileLabel: {
          type: PropValueType.string,
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
      jest.fn(),
      project
    );
    const moduleMetadata = moduleFile.getModuleMetadata();

    const expectedModuleMetadata: ModuleMetadata = {
      kind: FileMetadataKind.Module,
      filepath: expect.stringContaining(
        "ModuleFile/PanelWithComponentAndModule.tsx"
      ),
      metadataUUID: expect.any(String),
      propShape: {
        cardText: {
          type: PropValueType.string,
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
