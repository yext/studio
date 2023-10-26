import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  PropValueKind,
  PropValueType,
  PropValues,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

describe("getActiveComponentState", () => {
  it("can get the current active component within a page", () => {
    mockInitialStore();
    const componentState = useStudioStore
      .getState()
      .actions.getActiveComponentState();
    expect(componentState).toEqual(
      expect.objectContaining({
        componentName: "MyBanner",
      })
    );
  });
});

describe("getComponentTree", () => {
  it("can get the component tree when a page is being edited", () => {
    mockInitialStore();
    const tree = useStudioStore.getState().actions.getComponentTree();
    expect(tree).toEqual([
      expect.objectContaining({
        componentName: "MyBanner",
      }),
    ]);
  });
});

describe("updateComponentTree", () => {
  it("can rearrange the component tree when a page is being edited", () => {
    mockInitialStore();
    const updatedTree: ComponentState[] = [
      {
        kind: ComponentStateKind.BuiltIn,
        props: {},
        componentName: "div",
        uuid: "div-0",
      },
    ];
    useStudioStore.getState().actions.updateComponentTree(updatedTree);
    const tree = useStudioStore.getState().actions.getComponentTree();
    expect(tree).toEqual(updatedTree);
  });
});

describe("updateActiveComponentProps", () => {
  it("updates the active component props in the current active page", () => {
    mockInitialStore();
    const updatedProps: PropValues = {
      hi: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "bye bye bocchi",
      },
    };
    useStudioStore.getState().actions.updateActiveComponentProps(updatedProps);
    const componentStateAfterUpdate = useStudioStore
      .getState()
      .actions.getActiveComponentState();
    expect(componentStateAfterUpdate).toEqual(
      expect.objectContaining({
        componentName: "MyBanner",
        props: updatedProps,
      })
    );
  });
});

function mockInitialStore() {
  mockStore({
    pages: {
      activePageName: "testpage",
      activeComponentUUID: "banner-0",
      pages: {
        testpage: {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              componentName: "MyBanner",
              props: {},
              uuid: "banner-0",
              metadataUUID: "bannerMeta",
            },
          ],
          styleImports: [],
          filepath: "page-filepath",
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        bannerMeta: {
          metadataUUID: "bannerMeta",
          kind: FileMetadataKind.Component,
          filepath: "component-filepath",
          styleImports: [],
        },
      },
    },
  });
}
