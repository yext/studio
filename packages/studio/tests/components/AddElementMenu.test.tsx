import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import AddElementMenu from "../../src/components/AddElementMenu/AddElementMenu";
import useStudioStore from "../../src/store/useStudioStore";
import mockActivePage from "../__utils__/mockActivePage";
import mockStore from "../__utils__/mockStore";

beforeEach(() => {
  mockActivePage({
    componentTree: [],
    filepath: "",
    cssImports: [],
  });
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
  await userEvent.click(screen.getByText("Mock-Component"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-component",
      props: {},
      uuid: expect.any(String),
    },
  ]);
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
  await userEvent.click(screen.getByText("Mock-Container"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "Mock-Container",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-container",
      props: {},
      uuid: expect.any(String),
    },
  ]);
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
  await userEvent.click(screen.getByText("Mock-Module"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "Mock-Module",
      kind: ComponentStateKind.Module,
      metadataUUID: "uuid-module",
      props: {},
      uuid: expect.any(String),
    },
  ]);
});

describe("sets parentUUID for added component correctly", () => {
  it("no active component", async () => {
    mockActivePage({
      componentTree: [{
        componentName: "Mock-Container",
        kind: ComponentStateKind.Standard,
        metadataUUID: "uuid-container",
        props: {},
        uuid: "mock-container-uuid",
      }],
      filepath: "",
      cssImports: [],
    });
    render(<AddElementMenu />);
    await userEvent.click(screen.getByText("Mock-Component"));
    expect(useStudioStore.getState().actions.getComponentTree()).toContainEqual({
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-component",
      props: {},
      uuid: expect.any(String),
      parentUUID: undefined
    });
  });

  it("container as active component", async () => {
    mockActivePage({
      componentTree: [{
        componentName: "Mock-Container",
        kind: ComponentStateKind.Standard,
        metadataUUID: "uuid-container",
        props: {},
        uuid: "mock-container-uuid",
      }],
      filepath: "",
      cssImports: [],
    });
    useStudioStore.getState().pages.setActiveComponentUUID("mock-container-uuid");
    render(<AddElementMenu />);
    await userEvent.click(screen.getByText("Mock-Component"));
    expect(useStudioStore.getState().actions.getComponentTree()).toContainEqual({
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-component",
      props: {},
      uuid: expect.any(String),
      parentUUID: "mock-container-uuid"
    });
  });

  it("regular component as active component", async () => {
    mockActivePage({
      componentTree: [{
        componentName: "Mock-Component",
        kind: ComponentStateKind.Standard,
        metadataUUID: "uuid-component",
        props: {},
        uuid: "mock-component-uuid",
      }],
      filepath: "",
      cssImports: [],
    });
    useStudioStore.getState().pages.setActiveComponentUUID("mock-component-uuid");
    render(<AddElementMenu />);
    await userEvent.click(screen.getByText("Containers"));
    await userEvent.click(screen.getByText("Mock-Container"));
    expect(useStudioStore.getState().actions.getComponentTree()).toContainEqual({
      componentName: "Mock-Container",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-container",
      props: {},
      uuid: expect.any(String),
      parentUUID: undefined,
    });
  });

  it("module as active component", async () => {
    mockActivePage({
      componentTree: [{
        componentName: "Mock-Module",
        kind: ComponentStateKind.Module,
        metadataUUID: "uuid-module",
        props: {},
        uuid: "mock-module-uuid",
      }],
      filepath: "",
      cssImports: [],
    });
    useStudioStore.getState().pages.setActiveComponentUUID("mock-module-uuid");
    render(<AddElementMenu />);
    await userEvent.click(screen.getByText("Mock-Component"));
    expect(useStudioStore.getState().actions.getComponentTree()).toContainEqual({
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-component",
      props: {},
      uuid: expect.any(String),
      parentUUID: undefined
    });
  });

  it("built-in component as active component", async () => {
    mockActivePage({
      componentTree: [{
        kind: ComponentStateKind.BuiltIn,
        componentName: "div",
        props: {},
        uuid: "mock-builtin-uuid"
      }],
      filepath: "",
      cssImports: [],
    });
    useStudioStore.getState().pages.setActiveComponentUUID("mock-builtin-uuid");
    render(<AddElementMenu />);
    await userEvent.click(screen.getByText("Mock-Component"));
    expect(useStudioStore.getState().actions.getComponentTree()).toContainEqual({
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-component",
      props: {},
      uuid: expect.any(String),
      parentUUID: "mock-builtin-uuid"
    });
  });

  it("fragment as active component", async () => {
    mockActivePage({
      componentTree: [{
        kind: ComponentStateKind.Fragment,
        uuid: "mock-fragment-uuid"
      }],
      filepath: "",
      cssImports: [],
    });
    useStudioStore.getState().pages.setActiveComponentUUID("mock-fragment-uuid");
    render(<AddElementMenu />);
    await userEvent.click(screen.getByText("Mock-Component"));
    expect(useStudioStore.getState().actions.getComponentTree()).toContainEqual({
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "uuid-component",
      props: {},
      uuid: expect.any(String),
      parentUUID: "mock-fragment-uuid"
    });
  });
});
