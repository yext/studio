import { within, screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PreviewPanel from "../../src/components/PreviewPanel";
import useStudioStore from "../../src/store/useStudioStore";
import {
  nestedComponentTree,
  componentState,
  mockUUIDToFileMetadata,
} from "../__fixtures__/mockStoreNestedComponents";
import mockStore from "../__utils__/mockStore";
import {
  ComponentState,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { loadComponents } from "../../src/utils/loadUserAssets";

const mockSetState = jest.fn();

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation();
});

describe("renders preview", () => {
  it("renders component tree with nested Component(s)", async () => {
    await mockPreviewState(nestedComponentTree);
    render(<PreviewPanel setTooltipProps={mockSetState} />);
    const container1 = await screen.findByText(/Container 1/);
    const container2 = await within(container1).findByText(/Container 2/);
    const banner1 = await within(container1).findByText(/Banner 1/);
    const banner2 = await within(container2).findByText(/Banner 2/);
    expect(container1).toBeDefined();
    expect(container2).toBeDefined();
    expect(banner1).toBeDefined();
    expect(banner2).toBeDefined();
  });

  it("renders component with transformed props", async () => {
    const tree: ComponentState[] = [
      {
        ...componentState,
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
      },
    ];
    await mockPreviewState(tree);
    render(<PreviewPanel setTooltipProps={mockSetState} />);
    const siteSettingsExpressionProp = await screen.findByText(/mock-api-key/);
    expect(siteSettingsExpressionProp).toBeDefined();
    const documentExpressionProp = await screen.findByText(/123/);
    expect(documentExpressionProp).toBeDefined();
  });

  it("can render component using nested siteSettings expression", async () => {
    const tree: ComponentState[] = [
      {
        ...componentState,
        props: {
          title: {
            kind: PropValueKind.Expression,
            value: 'siteSettings.["Global Colors"].primary',
            valueType: PropValueType.HexColor,
          },
        },
      },
    ];
    await mockPreviewState(tree);
    render(<PreviewPanel setTooltipProps={mockSetState} />);
    const siteSettingsExpressionProp = await screen.findByText(/#AABBCC/);
    expect(siteSettingsExpressionProp).toBeDefined();
  });

  it("can render component using prop of PropValueType.Object", async () => {
    const tree: ComponentState[] = [
      {
        ...componentState,
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
      },
    ];
    await mockPreviewState(tree);
    render(<PreviewPanel setTooltipProps={mockSetState} />);
    const nestedPropUsage = await screen.findByText(/eggyweggy/);
    expect(nestedPropUsage).toBeDefined();
  });
});

it("clicking a component in the preview updates the activeComponentUUID", async () => {
  await mockPreviewState(nestedComponentTree);
  render(<PreviewPanel setTooltipProps={mockSetState} />);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    undefined
  );
  const container1 = await screen.findByText(/Container 1/);
  await userEvent.click(container1);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    "container-uuid"
  );
  const banner1 = await within(container1).findByText(/Banner 1/);
  await userEvent.click(banner1);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    "banner-uuid"
  );
});

async function mockPreviewState(componentTree: ComponentState[]) {
  mockStore({
    pages: {
      pages: {
        universalPage: {
          componentTree,
          styleImports: [],
          filepath: "mock/file/path",
          pagesJS: {
            entityFiles: ["entityFile.json"],
            getPathValue: undefined,
          },
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: mockUUIDToFileMetadata,
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
  });
  await useStudioStore.getState().actions.updateActivePage("universalPage");
  await Promise.all(loadComponents());
}
