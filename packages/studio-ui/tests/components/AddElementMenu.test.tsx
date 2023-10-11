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
          filepath: "blah/MockComponent.tsx",
          cssImports: [],
        },
        "uuid-container": {
          kind: FileMetadataKind.Component,
          metadataUUID: "cont",
          acceptsChildren: true,
          filepath: "blah/MockContainer.tsx",
          cssImports: [],
        },
      },
    },
    layouts: {
      layoutNameToLayoutState: {
        MyMockLayout: {
          componentTree: [
            {
              kind: ComponentStateKind.Standard,
              metadataUUID: "comp",
              componentName: "MockComponent",
              props: {},
              uuid: "component-inside-layout-uuid",
            },
          ],
          cssImports: [],
          filepath: "/filepath/to/MyMockLayout.tsx",
        },
      },
    },
  });
});

it("renders Components on load", () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  expect(screen.getByText("MockComponent")).toBeDefined();
  expect(screen.queryByText("MockContainer")).toBeNull();
  expect(closeMenu).not.toBeCalled();
});

it("can add a component to the tree", async () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  await userEvent.click(screen.getByText("MockComponent"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "MockComponent",
      kind: ComponentStateKind.Standard,
      metadataUUID: "comp",
      props: {},
      uuid: expect.any(String),
    },
  ]);
  expect(closeMenu).toBeCalledTimes(1);
});

it("can add a container to the tree", async () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  await userEvent.click(screen.getByText("Containers"));
  await userEvent.click(screen.getByText("MockContainer"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "MockContainer",
      kind: ComponentStateKind.Standard,
      metadataUUID: "cont",
      props: {},
      uuid: expect.any(String),
    },
  ]);
  expect(closeMenu).toBeCalledTimes(1);
});

it("can add layouts to the tree", async () => {
  render(<AddElementMenu closeMenu={closeMenu} />);
  await userEvent.click(screen.getByText("Layouts"));
  await userEvent.click(screen.getByText("MyMockLayout"));
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    {
      componentName: "MockComponent",
      kind: ComponentStateKind.Standard,
      metadataUUID: "comp",
      props: {},
      uuid: expect.any(String),
    },
  ]);
  expect(closeMenu).toBeCalledTimes(1);
});
