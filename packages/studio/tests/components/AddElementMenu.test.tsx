import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import AddElementMenu from "../../src/components/AddElementMenu";
import mockStore from "../__utils__/mockStore";

let setActivePageState;
beforeEach(() => {
  setActivePageState = jest.fn();
  mockStore({
    pages: {
      getActivePageState: () => {
        return {
          componentTree: [
            {
              kind: ComponentStateKind.BuiltIn,
              componentName: "div",
              uuid: "mock-div",
              props: {},
            },
          ],
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

it("can add components to the tree", () => {
  render(<AddElementMenu />);
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  fireEvent.click(screen.getByText("Mock-Component"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      {
        componentName: "div",
        kind: ComponentStateKind.BuiltIn,
        props: {},
        uuid: "mock-div",
      },
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

it("can switch to Modules", () => {
  render(<AddElementMenu />);
  fireEvent.click(screen.getByText("Modules"));
  expect(screen.queryByText("Mock-Component")).toBeNull();
  expect(screen.queryByText("Mock-Container")).toBeNull();
  expect(screen.getByText("Mock-Module")).toBeDefined();
});
