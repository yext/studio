import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PageState,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

const initialTree: ComponentState[] = [
  {
    componentName: "Mock-Container",
    kind: ComponentStateKind.Standard,
    metadataUUID: "uuid-container",
    props: {},
    uuid: "mock-container-uuid",
  },
  {
    componentName: "Mock-Component",
    kind: ComponentStateKind.Standard,
    metadataUUID: "uuid-component",
    props: {},
    uuid: "mock-component-uuid",
    parentUUID: "mock-container-uuid",
  },
  {
    componentName: "Mock-Module",
    kind: ComponentStateKind.Module,
    metadataUUID: "uuid-module",
    props: {},
    uuid: "mock-module-uuid",
    parentUUID: "mock-container-uuid",
  },
  {
    kind: ComponentStateKind.Fragment,
    uuid: "mock-fragment-uuid",
  },
  {
    kind: ComponentStateKind.BuiltIn,
    componentName: "div",
    props: {},
    uuid: "mock-builtin-uuid",
    parentUUID: "mock-fragment-uuid",
  },
];
const newComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "AddedComp",
  uuid: "added-comp",
  props: {},
  metadataUUID: "unused",
};

beforeEach(() => {
  mockStore({
    fileMetadatas: {
      UUIDToFileMetadata: {
        "uuid-component": {
          kind: FileMetadataKind.Component,
          metadataUUID: "uuid-component",
          filepath: "blah/Mock-Component.tsx",
        },
        "uuid-container": {
          kind: FileMetadataKind.Component,
          metadataUUID: "uuid-container",
          acceptsChildren: true,
          filepath: "blah/Mock-Container.tsx",
        },
        "uuid-module": {
          kind: FileMetadataKind.Module,
          metadataUUID: "uuid-module",
          componentTree: [],
          filepath: "blah/Mock-Module.tsx",
        },
        StarModuleMetadataUUID: {
          kind: FileMetadataKind.Module,
          componentTree: initialTree,
          metadataUUID: "StarModuleMetadataUUID",
          filepath: "unused",
        },
      },
    },
  });
});

describe("adds components to ModuleMetadata when a module is being edited", () => {
  beforeEach(() => {
    mockStore({
      pages: {
        moduleUUIDBeingEdited: "ModuleState.uuid",
        activePageName: "pagename",
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
      },
    });
  });

  insertionOrderTestSuite(() => {
    return useStudioStore.getState().fileMetadatas.UUIDToFileMetadata[
      "StarModuleMetadataUUID"
    ];
  });
});

describe("adds components to the active PageState when no module is being edited", () => {
  beforeEach(() => {
    mockStore({
      pages: {
        activePageName: "pagename",
        pages: {
          pagename: {
            componentTree: initialTree,
            cssImports: [],
            filepath: "unused",
          },
        },
      },
    });
  });

  insertionOrderTestSuite(() => {
    return useStudioStore.getState().pages.pages["pagename"];
  });
});

function insertionOrderTestSuite(
  getExpectedObject: () => PageState | FileMetadata
) {
  it("puts new component at end when no active component", () => {
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [...initialTree, newComponentState],
      })
    );
  });

  it("puts new component at end when container is active component", () => {
    useStudioStore
      .getState()
      .pages.setActiveComponentUUID("mock-container-uuid");
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          ...initialTree,
          { ...newComponentState, parentUUID: "mock-container-uuid" },
        ],
      })
    );
  });

  it("puts new component directly after regular component if it is active component", () => {
    useStudioStore
      .getState()
      .pages.setActiveComponentUUID("mock-component-uuid");
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          ...initialTree.slice(0, 2),
          { ...newComponentState, parentUUID: "mock-container-uuid" },
          ...initialTree.slice(2),
        ],
      })
    );
  });

  it("puts new component directly after module if it is active component", () => {
    useStudioStore.getState().pages.setActiveComponentUUID("mock-module-uuid");
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          ...initialTree.slice(0, 3),
          { ...newComponentState, parentUUID: "mock-container-uuid" },
          ...initialTree.slice(3),
        ],
      })
    );
  });

  it("puts new component at end when fragment is active component", () => {
    useStudioStore
      .getState()
      .pages.setActiveComponentUUID("mock-fragment-uuid");
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          ...initialTree,
          { ...newComponentState, parentUUID: "mock-fragment-uuid" },
        ],
      })
    );
  });

  it("puts new component at end when built-in compoent is active component", () => {
    useStudioStore.getState().pages.setActiveComponentUUID("mock-builtin-uuid");
    useStudioStore.getState().actions.addComponent(newComponentState);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          ...initialTree,
          { ...newComponentState, parentUUID: "mock-builtin-uuid" },
        ],
      })
    );
  });
}
