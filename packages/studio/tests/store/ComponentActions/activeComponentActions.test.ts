import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  PropValueKind,
  PropValues,
  PropValueType,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

describe("getActiveComponentState", () => {
  it("can get the current active component within a module", () => {
    mockInitialStore(true);
    const componentState = useStudioStore
      .getState()
      .actions.getActiveComponentState();
    expect(componentState).toEqual(
      expect.objectContaining({
        componentName: "Banner",
      })
    );
  });

  it("can get the current active componentwithin a page", () => {
    mockInitialStore(false);
    const componentState = useStudioStore
      .getState()
      .actions.getActiveComponentState();
    expect(componentState).toEqual(
      expect.objectContaining({
        componentName: "MyModule",
      })
    );
  });
});

describe("updateActiveComponentProps", () => {
  it("when a module is being edited, updates the props inside the module's tree", () => {
    mockInitialStore(true);
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
        componentName: "Banner",
        props: updatedProps,
      })
    );
  });

  it("when a module is not being edited, updates the props in the current active page", () => {
    mockInitialStore(false);
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
        componentName: "MyModule",
        props: updatedProps,
      })
    );
  });
});

describe("getComponentTree", () => {
  it("can get the component tree when a module is being edited", () => {
    mockInitialStore(true);
    const tree = useStudioStore.getState().actions.getComponentTree();
    expect(tree).toEqual([
      expect.objectContaining({
        componentName: "Banner",
      }),
    ]);
  });
  it("can get the component tree when a page is being edited", () => {
    mockInitialStore(false);
    const tree = useStudioStore.getState().actions.getComponentTree();
    expect(tree).toEqual([
      expect.objectContaining({
        componentName: "MyModule",
      }),
    ]);
  });
});

describe("updateComponentTree", () => {
  it("can rearrange the component tree when a module is being edited", () => {
    mockInitialStore(true);
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

  it("can rearrange the component tree when a page is being edited", () => {
    mockInitialStore(false);
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

function mockInitialStore(isEditingModule: boolean) {
  mockStore({
    pages: {
      activePageName: "testpage",
      moduleUUIDBeingEdited: isEditingModule ? "module-0" : undefined,
      activeComponentUUID: isEditingModule ? "banner-0" : "module-0",
      pages: {
        testpage: {
          componentTree: [
            {
              kind: ComponentStateKind.Module,
              componentName: "MyModule",
              props: {},
              uuid: "module-0",
              metadataUUID: "moduleMeta",
            },
          ],
          cssImports: [],
          filepath: "page-filepath",
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        moduleMeta: {
          metadataUUID: "moduleMeta",
          kind: FileMetadataKind.Module,
          filepath: "module-filepath",
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              props: {},
              componentName: "Banner",
              uuid: "banner-0",
              metadataUUID: "bannerMeta",
            },
          ],
        },
      },
    },
  });
}
