import { render, screen, within } from "@testing-library/react";
import ComponentTreePreview from "../../src/components/ComponentTreePreview";
import mockStore, { MockStudioStore } from "../__utils__/mockStore";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  PageState,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import path from "path";

const UUIDToFileMetadata: Record<string, FileMetadata> = {
  "banner-metadata-uuid": {
    kind: FileMetadataKind.Component,
    metadataUUID: "banner-metadata-uuid",
    propShape: {
      title: { type: PropValueType.string },
      num: { type: PropValueType.number },
      bool: { type: PropValueType.boolean },
      bgColor: { type: PropValueType.HexColor },
      nestedProp: {
        type: PropValueType.Object,
        shape: {
          egg: {
            type: PropValueType.string,
          },
        },
      },
    },
    filepath: path.resolve(__dirname, "../__mocks__/Banner.tsx"),
  },
};
const mockStoreNestedComponentState: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "Container",
            props: {
              text: {
                kind: PropValueKind.Literal,
                value: "Container 1",
                valueType: PropValueType.string,
              },
            },
            uuid: "container-uuid",
            metadataUUID: "container-metadata-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Literal,
                value: "Banner 1",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid",
            metadataUUID: "banner-metadata-uuid",
            parentUUID: "container-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Container",
            props: {
              text: {
                kind: PropValueKind.Literal,
                value: "Container 2",
                valueType: PropValueType.string,
              },
            },
            uuid: "container-uuid-2",
            metadataUUID: "container-metadata-uuid",
            parentUUID: "container-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Literal,
                value: "Banner 2",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid-2",
            metadataUUID: "banner-metadata-uuid",
            parentUUID: "container-uuid-2",
          },
        ],
        filepath: "mock/file/path",
        entityFiles: ["entityFile.json"],
        cssImports: [],
      },
    },
    activePageName: "universalPage",
    activeEntityFile: "entityFile.json",
  },
  fileMetadatas: {
    UUIDToFileMetadata: {
      ...UUIDToFileMetadata,
      "container-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "container-metadata-uuid",
        propShape: {
          text: { type: PropValueType.string },
        },
        filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
      },
    },
  },
};

const moduleMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  metadataUUID: "panel-metadata-uuid",
  propShape: {
    text: { type: PropValueType.string },
  },
  filepath: path.resolve(__dirname, "../__mocks__/Panel.tsx"),
  componentTree: [
    {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
    {
      kind: ComponentStateKind.Standard,
      componentName: "Banner",
      uuid: "internal-banner-uuid",
      props: {
        title: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "props.text",
        },
      },
      metadataUUID: "banner-metadata-uuid",
      parentUUID: "fragment-uuid",
    },
    {
      kind: ComponentStateKind.BuiltIn,
      componentName: "button",
      props: {},
      uuid: "button-uuid",
      parentUUID: "fragment-uuid",
    },
  ],
};

const mockStoreModuleState: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
          {
            kind: ComponentStateKind.Module,
            componentName: "Panel",
            props: {
              text: {
                kind: PropValueKind.Literal,
                value: "This is Panel module",
                valueType: PropValueType.string,
              },
            },
            uuid: "panel-uuid",
            metadataUUID: "panel-metadata-uuid",
          },
        ],
        cssImports: [],
        filepath: "mock/file/path",
      },
    },
    activePageName: "universalPage",
  },
  fileMetadatas: {
    UUIDToFileMetadata: {
      ...UUIDToFileMetadata,
      "panel-metadata-uuid": moduleMetadata,
    },
  },
};

const mockStoreWithPropExpression: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "siteSettings.apiKey",
                valueType: PropValueType.string,
              },
              num: {
                kind: PropValueKind.Expression,
                value: "document.employeeCount",
                valueType: PropValueType.number,
              },
            },
            uuid: "banner-uuid",
            metadataUUID: "banner-metadata-uuid",
          },
        ],
        cssImports: [],
        entityFiles: ["entityFile.json"],
        filepath: "mock/file/path",
      },
    },
    activePageName: "universalPage",
    activeEntityFile: "entityFile.json",
  },
  fileMetadatas: {
    UUIDToFileMetadata,
  },
  siteSettings: {
    values: {
      apiKey: {
        kind: PropValueKind.Literal,
        value: "mock-api-key",
        valueType: PropValueType.string,
      },
    },
  },
};

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation();
});

it("renders component tree with nested Component(s)", async () => {
  mockStore(mockStoreNestedComponentState);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockStoreNestedComponentState).componentTree}
    />
  );
  const container1 = await screen.findByText(/Container 1/);
  const container2 = await within(container1).findByText(/Container 2/);
  const banner1 = await within(container1).findByText(/Banner 1/);
  const banner2 = await within(container2).findByText(/Banner 2/);
  expect(container1).toBeDefined();
  expect(container2).toBeDefined();
  expect(banner1).toBeDefined();
  expect(banner2).toBeDefined();
});

it("renders component tree with Module component type", async () => {
  mockStore(mockStoreModuleState);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockStoreModuleState).componentTree}
    />
  );
  const panel = await screen.findByText(/This is Panel module/);
  const button = await within(panel).findByText(/This is button/);
  const banner = await within(panel).findByText(/This is Banner/);
  expect(panel).toBeDefined();
  expect(button).toBeDefined();
  expect(banner).toBeDefined();
});

it("renders component with transformed props", async () => {
  mockStore(mockStoreWithPropExpression);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockStoreWithPropExpression).componentTree}
    />
  );
  const siteSettingsExpressionProp = await screen.findByText(/mock-api-key/);
  expect(siteSettingsExpressionProp).toBeDefined();
  const documentExpressionProp = await screen.findByText(/123/);
  expect(documentExpressionProp).toBeDefined();
});

it("renders component tree with an updated Module component with props", async () => {
  mockStore({
    ...mockStoreModuleState,
    fileMetadatas: {
      ...mockStoreModuleState.fileMetadatas,
      pendingChanges: {
        modulesToUpdate: new Set(["panel-metadata-uuid"]),
      },
      UUIDToImportedComponent: {
        test: () => {
          return null;
        },
      },
    },
  });
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockStoreModuleState).componentTree}
    />
  );
  expect(await screen.findByText(/This is Panel module/)).toBeDefined();
  expect(await screen.findByRole("button")).toBeDefined();
});

it("can render component using nested siteSettings expression", async () => {
  const mockState: MockStudioStore = {
    pages: {
      pages: {
        universalPage: {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "Banner",
              props: {
                title: {
                  kind: PropValueKind.Expression,
                  value: 'siteSettings.["Global Colors"].primary',
                  valueType: PropValueType.HexColor,
                },
              },
              uuid: "banner-uuid",
              metadataUUID: "banner-metadata-uuid",
            },
          ],
          cssImports: [],
          entityFiles: ["entityFile.json"],
          filepath: "mock/file/path",
        },
      },
      activePageName: "universalPage",
    },
    fileMetadatas: {
      UUIDToFileMetadata,
    },
    siteSettings: {
      values: {
        "Global Colors": {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            primary: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#AABBCC",
            },
          },
        },
      },
    },
  };
  mockStore(mockState);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockState).componentTree}
    />
  );
  const siteSettingsExpressionProp = await screen.findByText(/#AABBCC/);
  expect(siteSettingsExpressionProp).toBeDefined();
});

it("can render component using prop of PropValueType.Object", async () => {
  const mockState: MockStudioStore = {
    pages: {
      pages: {
        universalPage: {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "Banner",
              props: {
                nestedProp: {
                  kind: PropValueKind.Literal,
                  value: {
                    egg: {
                      kind: PropValueKind.Literal,
                      valueType: PropValueType.string,
                      value: "eggyweggy",
                    },
                  },
                  valueType: PropValueType.Object,
                },
              },
              uuid: "banner-uuid",
              metadataUUID: "banner-metadata-uuid",
            },
          ],
          cssImports: [],
          filepath: "mock/file/path",
        },
      },
      activePageName: "universalPage",
    },
    fileMetadatas: {
      UUIDToFileMetadata,
    },
  };
  mockStore(mockState);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockState).componentTree}
    />
  );
  const nestedPropUsage = await screen.findByText(/eggyweggy/);
  expect(nestedPropUsage).toBeDefined();
});

function getPageState(
  store: MockStudioStore,
  pageName = "universalPage"
): PageState {
  const pageState = store.pages?.pages?.[pageName];
  if (!pageState) {
    throw new Error(
      `Unable to get pageState for page ${pageName} from test's mocked store.`
    );
  }
  return pageState;
}
