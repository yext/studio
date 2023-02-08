import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

describe("adds components to ModuleMetadata when a module is being edited", () => {
  const pagesState = {
    moduleUUIDBeingEdited: "ModuleState.uuid",
    activePageName: "pagename",
    activeComponentUUID: "mock-comp-uuid",
    pages: {
      pagename: {
        componentTree: [
          {
            kind: ComponentStateKind.Module,
            uuid: "ModuleState.uuid",
            metadataUUID: "StarModuleMetadataUUID",
            componentName: "StarModule",
            props: {},
          },
        ],
        cssImports: [],
        filepath: "unused",
      },
    },
  };

  it("puts new component directly after active component when it is not the parent", () => {
    const initialTree = [
      {
        kind: ComponentStateKind.Standard,
        componentName: "AComponent",
        uuid: "mock-comp-uuid",
        props: {},
        metadataUUID: "unused",
      },
      {
        kind: ComponentStateKind.Standard,
        componentName: "BComponent",
        uuid: "unused",
        props: {},
        metadataUUID: "unused",
      },
    ];
    mockStore({
      fileMetadatas: {
        UUIDToFileMetadata: {
          StarModuleMetadataUUID: {
            kind: FileMetadataKind.Module,
            componentTree: initialTree,
            metadataUUID: "StarModuleMetadataUUID",
            filepath: "unused",
          },
        },
      },
      pages: pagesState,
    });

    const newComponentState = {
      kind: ComponentStateKind.Standard,
      componentName: "AddedComp",
      uuid: "added-comp",
      props: {},
      metadataUUID: "metadata-uuid",
    };
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(
      useStudioStore.getState().fileMetadatas.UUIDToFileMetadata[
        "StarModuleMetadataUUID"
      ]
    ).toEqual(
      expect.objectContaining({
        componentTree: [initialTree[0], newComponentState, initialTree[1]],
      })
    );
  });

  it("puts new component at the end when active component is the parent", () => {
    const initialTree = [
      {
        kind: ComponentStateKind.Standard,
        componentName: "AComponent",
        uuid: "mock-comp-uuid",
        props: {},
        metadataUUID: "unused",
      },
      {
        kind: ComponentStateKind.Standard,
        componentName: "BComponent",
        uuid: "unused",
        props: {},
        metadataUUID: "unused",
        parentUUID: "mock-comp-uuid",
      },
    ];
    mockStore({
      fileMetadatas: {
        UUIDToFileMetadata: {
          StarModuleMetadataUUID: {
            kind: FileMetadataKind.Module,
            componentTree: initialTree,
            metadataUUID: "StarModuleMetadataUUID",
            filepath: "unused",
          },
        },
      },
      pages: pagesState,
    });

    const newComponentState = {
      kind: ComponentStateKind.Standard,
      componentName: "AddedComp",
      uuid: "added-comp",
      props: {},
      metadataUUID: "metadata-uuid",
      parentUUID: "mock-comp-uuid",
    };
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(
      useStudioStore.getState().fileMetadatas.UUIDToFileMetadata[
        "StarModuleMetadataUUID"
      ]
    ).toEqual(
      expect.objectContaining({
        componentTree: [...initialTree, newComponentState],
      })
    );
  });
});

describe("adds components to the active PageState when no module is being edited", () => {
  it("puts new component directly after active component when it is not the parent", () => {
    const initialTree = [
      {
        kind: ComponentStateKind.Standard,
        componentName: "AComponent",
        uuid: "mock-comp-uuid",
        props: {},
        metadataUUID: "unused",
      },
      {
        kind: ComponentStateKind.Standard,
        componentName: "BComponent",
        uuid: "unused",
        props: {},
        metadataUUID: "unused",
      },
    ];
    mockStore({
      pages: {
        activePageName: "pagename",
        activeComponentUUID: "mock-comp-uuid",
        pages: {
          pagename: {
            componentTree: initialTree,
            cssImports: [],
            filepath: "unused",
          },
        },
      },
    });
    const newComponentState = { ...initialTree[0], uuid: "new-comp" };
    useStudioStore.getState().actions.addComponent(newComponentState);
    const updatedTree =
      useStudioStore.getState().pages.pages["pagename"].componentTree;
    expect(updatedTree).toEqual([
      initialTree[0],
      newComponentState,
      initialTree[1],
    ]);
  });

  it("puts new component at the end when active component is the parent", () => {
    const initialTree = [
      {
        kind: ComponentStateKind.Standard,
        componentName: "AComponent",
        uuid: "mock-comp-uuid",
        props: {},
        metadataUUID: "unused",
      },
      {
        kind: ComponentStateKind.Standard,
        componentName: "BComponent",
        uuid: "unused",
        props: {},
        metadataUUID: "unused",
        parentUID: "mock-comp-uuid",
      },
    ];
    mockStore({
      pages: {
        activePageName: "pagename",
        activeComponentUUID: "mock-comp-uuid",
        pages: {
          pagename: {
            componentTree: initialTree,
            cssImports: [],
            filepath: "unused",
          },
        },
      },
    });
    const newComponentState = {
      ...initialTree[0],
      uuid: "new-comp",
      parentUUID: "mock-comp-uuid",
    };
    useStudioStore.getState().actions.addComponent(newComponentState);
    const updatedTree =
      useStudioStore.getState().pages.pages["pagename"].componentTree;
    expect(updatedTree).toEqual([...initialTree, newComponentState]);
  });
});
