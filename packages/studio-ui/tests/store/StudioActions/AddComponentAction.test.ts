import {
  ComponentMetadata,
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PageState,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";
import { mockActivePageTree } from "../../__utils__/mockActivePageTree";

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

beforeEach(() => {
  mockStore({
    fileMetadatas: {
      UUIDToFileMetadata: {
        "uuid-component": {
          kind: FileMetadataKind.Component,
          metadataUUID: "uuid-component",
          filepath: "blah/Mock-Component.tsx",
          styleImports: [],
        },
        "uuid-container": {
          kind: FileMetadataKind.Component,
          metadataUUID: "uuid-container",
          acceptsChildren: true,
          filepath: "blah/Mock-Container.tsx",
          styleImports: [],
        },
      },
    },
  });
});

describe("adds components to the active PageState", () => {
  beforeEach(() => {
    mockActivePageTree(initialTree);
  });

  insertionOrderTestSuite(() => {
    return useStudioStore.getState().pages.pages["pagename"];
  });
});

function insertionOrderTestSuite(
  getExpectedObject: () => PageState | FileMetadata
) {
  const componentMetadata: ComponentMetadata = {
    kind: FileMetadataKind.Component,
    filepath: "./blah/AddedComp.tsx",
    metadataUUID: "unused",
    styleImports: [],
  };

  const newComponentState: ComponentState = {
    kind: ComponentStateKind.Standard,
    componentName: "AddedComp",
    uuid: expect.any(String),
    props: {},
    metadataUUID: "unused",
  };

  it("puts new component at start when no active component", () => {
    useStudioStore.getState().actions.addComponent(componentMetadata);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [newComponentState, ...initialTree],
      })
    );
  });

  it("puts new component at start if container is active component", () => {
    useStudioStore
      .getState()
      .pages.setActiveComponentUUID("mock-container-uuid");
    useStudioStore.getState().actions.addComponent(componentMetadata);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          { ...newComponentState, parentUUID: "mock-container-uuid" },
          ...initialTree,
        ],
      })
    );
  });

  it("puts new component directly after regular component if it is active component", () => {
    useStudioStore
      .getState()
      .pages.setActiveComponentUUID("mock-component-uuid");
    useStudioStore.getState().actions.addComponent(componentMetadata);
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

  it("puts new component at start if fragment is active component", () => {
    useStudioStore
      .getState()
      .pages.setActiveComponentUUID("mock-fragment-uuid");
    useStudioStore.getState().actions.addComponent(componentMetadata);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          { ...newComponentState, parentUUID: "mock-fragment-uuid" },
          ...initialTree,
        ],
      })
    );
  });

  it("puts new component at start if built-in component is active component", () => {
    useStudioStore.getState().pages.setActiveComponentUUID("mock-builtin-uuid");
    useStudioStore.getState().actions.addComponent(componentMetadata);
    expect(getExpectedObject()).toEqual(
      expect.objectContaining({
        componentTree: [
          { ...newComponentState, parentUUID: "mock-builtin-uuid" },
          ...initialTree,
        ],
      })
    );
  });
}
