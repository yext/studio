import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import AddElementMenu from "../../src/components/AddElementMenu/AddElementMenu";
import useStudioStore from "../../src/store/useStudioStore";
import mockActivePage from "../__utils__/mockActivePage";
import mockStore from "../__utils__/mockStore";

const closeMenu = jest.fn();
beforeEach(() => {
  closeMenu.mockReset();
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
          metadataUUID: "comp",
          filepath: "blah/Mock-Component.tsx",
        },
        "uuid-container": {
          kind: FileMetadataKind.Component,
          metadataUUID: "cont",
          acceptsChildren: true,
          filepath: "blah/Mock-Container.tsx",
        },
      },
    },
  });
});

it("renders Components on load", () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  expect(screen.getByText("Mock-Component")).toBeDefined();
  expect(screen.queryByText("Mock-Container")).toBeNull();
  expect(closeMenu).not.toBeCalled();
});

it("can add a component to the tree", async () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  await userEvent.click(screen.getByText("Mock-Component"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "Mock-Component",
      kind: ComponentStateKind.Standard,
      metadataUUID: "comp",
      props: {},
      uuid: expect.any(String),
    },
  ]);
  expect(closeMenu).toBeCalledTimes(1);
});

it("can switch to Layouts", async () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  await userEvent.click(screen.getByText("Layouts"));
  expect(screen.queryByText("Mock-Component")).toBeNull();
  expect(screen.getByText("Mock-Container")).toBeDefined();
  expect(closeMenu).not.toBeCalled();
});

it("can add a container to the tree", async () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  await userEvent.click(screen.getByText("Layouts"));
  await userEvent.click(screen.getByText("Mock-Container"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "Mock-Container",
      kind: ComponentStateKind.Standard,
      metadataUUID: "cont",
      props: {},
      uuid: expect.any(String),
    },
  ]);
  expect(closeMenu).toBeCalledTimes(1);
});