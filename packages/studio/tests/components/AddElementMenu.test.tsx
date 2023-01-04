import { fireEvent, render, screen } from "@testing-library/react";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
} from "@yext/studio-plugin";
import AddElementMenu from "../../src/components/AddElementMenu";
import mockStore from "../__utils__/mockStore";

const rootComponent: ComponentState = {
  kind: ComponentStateKind.BuiltIn,
  componentName: "div",
  uuid: "mock-div",
  props: {},
};

let setActivePageState;
beforeEach(() => {
  setActivePageState = jest.fn();
  mockStore({
    pages: {
      getActivePageState: () => {
        return {
          componentTree: [rootComponent],
          filepath: "",
          cssImports: [],
        };
      },
      setActivePageState,
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        "uuid-component": {
          kind: FileMetadataKind.Component,
          metadataUUID: "comp",
          filepath: "blah/Mock-Component.tsx",
        },
        "uuid-container": {
          kind: FileMetadataKind.Component,
          metadataUUID: "cont",
          acceptsChildren: true,
          filepath: "blah/Mock-Container.tsx",
        },
        "uuid-module": {
          kind: FileMetadataKind.Module,
          metadataUUID: "modu",
          componentTree: [],
          filepath: "blah/Mock-Module.tsx",
        },
      },
    },
  });
});

it("renders Components on load", () => {
  render(<AddElementMenu />);
  expect(screen.getByText("Mock-Component")).toBeDefined();
  expect(screen.queryByText("Mock-Container")).toBeNull();
  expect(screen.queryByText("Mock-Module")).toBeNull();
});

it("can add a component to the tree", () => {
  render(<AddElementMenu />);
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  fireEvent.click(screen.getByText("Mock-Component"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      rootComponent,
      {
        componentName: "Mock-Component",
        kind: ComponentStateKind.Standard,
        metadataUUID: "comp",
        parentUUID: "mock-div",
        props: {},
        uuid: expect.any(String),
      },
    ],
    cssImports: [],
    filepath: "",
  });
});

it("can switch to Containers", () => {
  render(<AddElementMenu />);
  fireEvent.click(screen.getByText("Containers"));
  expect(screen.queryByText("Mock-Component")).toBeNull();
  expect(screen.getByText("Mock-Container")).toBeDefined();
  expect(screen.queryByText("Mock-Module")).toBeNull();
});

it("can add a container to the tree", () => {
  render(<AddElementMenu />);
  fireEvent.click(screen.getByText("Containers"));
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  fireEvent.click(screen.getByText("Mock-Container"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      rootComponent,
      {
        componentName: "Mock-Container",
        kind: ComponentStateKind.Standard,
        metadataUUID: "cont",
        parentUUID: "mock-div",
        props: {},
        uuid: expect.any(String),
      },
    ],
    cssImports: [],
    filepath: "",
  });
});

it("can switch to Modules", () => {
  render(<AddElementMenu />);
  fireEvent.click(screen.getByText("Modules"));
  expect(screen.queryByText("Mock-Component")).toBeNull();
  expect(screen.queryByText("Mock-Container")).toBeNull();
  expect(screen.getByText("Mock-Module")).toBeDefined();
});

it("can add a module to the tree", () => {
  render(<AddElementMenu />);
  fireEvent.click(screen.getByText("Modules"));
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  fireEvent.click(screen.getByText("Mock-Module"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      rootComponent,
      {
        componentName: "Mock-Module",
        kind: ComponentStateKind.Module,
        metadataUUID: "modu",
        parentUUID: "mock-div",
        props: {},
        uuid: expect.any(String),
      },
    ],
    cssImports: [],
    filepath: "",
  });
});
