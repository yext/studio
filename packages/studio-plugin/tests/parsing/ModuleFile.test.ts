import ModuleFile from "../../src/parsing/ModuleFile";
import * as getFileMetadataUtils from "../../src/getFileMetadata";
import * as uuidUtils from "uuid";
import { getModulePath } from "../__utils__/getFixturePath";
import {
  ComponentStateKind,
  ModuleMetadata,
  PropValueKind,
  PropValueType,
  PropShape,
  FileMetadataKind,
} from "../../src";

jest.mock("uuid");

describe("getModuleMetadata", () => {
  beforeEach(() => {
    let uuidCount = 0;
    jest.spyOn(uuidUtils, "v4").mockImplementation(() => {
      return `mock-uuid-${uuidCount++}`;
    });
    jest
      .spyOn(getFileMetadataUtils, "getFileMetadata")
      .mockImplementation((filepath) => {
        let propShape: PropShape = {};
        if (filepath?.endsWith("Card.tsx")) {
          propShape = {
            text: { type: PropValueType.string },
          };
        }
        if (filepath?.endsWith("Tile.tsx")) {
          propShape = {
            label: { type: PropValueType.string },
          };
        }
        return {
          kind: filepath?.includes("components/")
            ? FileMetadataKind.Component
            : FileMetadataKind.Module,
          metadataUUID: "mock-metadataUUID",
          propShape,
        };
      });
  });

  it("can parse a Module comprised of Component type", () => {
    const pathToModule = getModulePath("PanelWithComponents");
    const moduleFile = new ModuleFile(pathToModule);
    const moduleMetadata = moduleFile.getModuleMetadata();

    const expectedModuleMetadata: ModuleMetadata = {
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
          metadataUUID: "mock-metadataUUID",
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
          metadataUUID: "mock-metadataUUID",
          props: {},
        },
        {
          componentName: "Card",
          kind: ComponentStateKind.Standard,
          uuid: "mock-uuid-2",
          parentUUID: "mock-uuid-0",
          metadataUUID: "mock-metadataUUID",
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
    const moduleFile = new ModuleFile(pathToModule);
    const moduleMetadata = moduleFile.getModuleMetadata();

    const expectedModuleMetadata: ModuleMetadata = {
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
          metadataUUID: "mock-metadataUUID",
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
          metadataUUID: "mock-metadataUUID",
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
    const moduleFile = new ModuleFile(pathToModule);
    const moduleMetadata = moduleFile.getModuleMetadata();

    const expectedModuleMetadata: ModuleMetadata = {
      kind: FileMetadataKind.Module,
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
          metadataUUID: "mock-metadataUUID",
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
          metadataUUID: "mock-metadataUUID",
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
