import { render, screen, within } from "@testing-library/react";
import ComponentTreePreview from "../../src/components/ComponentTreePreview";
import mockStore, { MockStudioStore } from "../__utils__/mockStore";
import {
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  PageState,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import path from "path";
import {
  mockStoreNestedComponentState,
  mockUUIDToFileMetadata,
} from "../__fixtures__/mockStoreNestedComponents";
import { ExpressionSources } from "../../src/utils/getPreviewProps";

const moduleMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  metadataUUID: "panel-metadata-uuid",
  propShape: {
    text: { type: PropValueType.string, required: false },
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
      uuid: "internal-banner-uuid-0",
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
      kind: ComponentStateKind.Standard,
      componentName: "Banner",
      uuid: "internal-banner-uuid-1",
      props: {
        title: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "This is Banner",
        },
      },
      metadataUUID: "banner-metadata-uuid",
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
      ...mockUUIDToFileMetadata,
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
          {
            kind: ComponentStateKind.Module,
            componentName: "Panel",
            props: {
              text: {
                kind: PropValueKind.Expression,
                value: "siteSettings.someText",
                valueType: PropValueType.string,
              },
            },
            uuid: "panel-uuid",
            metadataUUID: "panel-metadata-uuid",
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
    UUIDToFileMetadata: {
      ...mockUUIDToFileMetadata,
      "panel-metadata-uuid": moduleMetadata,
    },
  },
  siteSettings: {
    values: {
      apiKey: {
        kind: PropValueKind.Literal,
        value: "mock-api-key",
        valueType: PropValueType.string,
      },
      someText: {
        kind: PropValueKind.Literal,
        value: "mock-text",
        valueType: PropValueType.string,
      },
    },
  },
};

const expressionSources: ExpressionSources = {
  siteSettings: {
    apiKey: "mock-api-key",
  },
  document: {
    employeeCount: 123,
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
      expressionSources={expressionSources}
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
      expressionSources={expressionSources}
    />
  );
  const panel = await screen.findByText(/This is Panel module/);
  const banner = await screen.findByText(/This is Banner/);
  expect(panel).toBeDefined();
  expect(banner).toBeDefined();
});

it("renders component with transformed props", async () => {
  mockStore(mockStoreWithPropExpression);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockStoreWithPropExpression).componentTree}
      expressionSources={{
        ...expressionSources,
        siteSettings: { apiKey: "mock-api-key", someText: "mock-text" },
      }}
    />
  );
  const siteSettingsExpressionProp = await screen.findByText(/mock-api-key/);
  expect(siteSettingsExpressionProp).toBeDefined();
  const documentExpressionProp = await screen.findByText(/123/);
  expect(documentExpressionProp).toBeDefined();
  const moduleExpressionProp = await screen.findByText(/mock-text/);
  expect(moduleExpressionProp).toBeDefined();
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
      UUIDToFileMetadata: mockUUIDToFileMetadata,
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
      expressionSources={{
        ...expressionSources,
        siteSettings: { "Global Colors": { primary: "#AABBCC" } },
      }}
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
      UUIDToFileMetadata: mockUUIDToFileMetadata,
    },
  };
  mockStore(mockState);
  render(
    <ComponentTreePreview
      componentTree={getPageState(mockState).componentTree}
      expressionSources={expressionSources}
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
