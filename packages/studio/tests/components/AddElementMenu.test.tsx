import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import AddElementMenu from "../../src/components/AddElementMenu";
import mockActivePage from "../__utils__/mockActivePage";
import mockStore from "../__utils__/mockStore";

let setActivePageState;
beforeEach(() => {
  setActivePageState = jest.fn();
  mockActivePage({
    componentTree: [],
    filepath: "",
    cssImports: [],
  });
  mockStore({
    pages: {
      setActivePageState,
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        "uuid-component": {
          prettyName: "Mock-Component",
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

it("can add a component to the tree", async () => {
  render(<AddElementMenu />);
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  await userEvent.click(screen.getByText("Mock-Component"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      {
        componentName: "Mock-Component",
        prettyName: "Mock-Component",
        kind: ComponentStateKind.Standard,
        metadataUUID: "comp",
        props: {},
        uuid: expect.any(String),
      },
    ],
    cssImports: [],
    filepath: "",
  });
});

it("can switch to Containers", async () => {
  render(<AddElementMenu />);
  await userEvent.click(screen.getByText("Containers"));
  expect(screen.queryByText("Mock-Component")).toBeNull();
  expect(screen.getByText("Mock-Container")).toBeDefined();
  expect(screen.queryByText("Mock-Module")).toBeNull();
});

it("can add a container to the tree", async () => {
  render(<AddElementMenu />);
  await userEvent.click(screen.getByText("Containers"));
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  await userEvent.click(screen.getByText("Mock-Container"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      {
        componentName: "Mock-Container",
        kind: ComponentStateKind.Standard,
        metadataUUID: "cont",
        props: {},
        uuid: expect.any(String),
      },
    ],
    cssImports: [],
    filepath: "",
  });
});

it("can switch to Modules", async () => {
  render(<AddElementMenu />);
  await userEvent.click(screen.getByText("Modules"));
  expect(screen.queryByText("Mock-Component")).toBeNull();
  expect(screen.queryByText("Mock-Container")).toBeNull();
  expect(screen.getByText("Mock-Module")).toBeDefined();
});

it("can add a module to the tree", async () => {
  render(<AddElementMenu />);
  await userEvent.click(screen.getByText("Modules"));
  expect(setActivePageState).toHaveBeenCalledTimes(0);
  await userEvent.click(screen.getByText("Mock-Module"));
  expect(setActivePageState).toHaveBeenCalledTimes(1);
  expect(setActivePageState).toHaveBeenCalledWith({
    componentTree: [
      {
        componentName: "Mock-Module",
        kind: ComponentStateKind.Module,
        metadataUUID: "modu",
        props: {},
        uuid: expect.any(String),
      },
    ],
    cssImports: [],
    filepath: "",
  });
});
