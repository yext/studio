import { render, screen } from "@testing-library/react";
import CreateModuleButton from "../../src/components/CreateModuleButton";
import { ComponentStateKind, FileMetadataKind } from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import userEvent from "@testing-library/user-event";
import { searchBarComponent } from "../__fixtures__/componentStates";
import mockStore from "../__utils__/mockStore";

beforeEach(() => {
  mockStore({
    pages: {
      pages: {
        universal: {
          componentTree: [
            {
              kind: ComponentStateKind.Fragment,
              uuid: "mock-uuid-0",
            },
            {
              ...searchBarComponent,
              uuid: "mock-uuid-1",
              parentUUID: "mock-uuid-0",
            },
            {
              kind: ComponentStateKind.Module,
              uuid: "mock-uuid-2",
              parentUUID: "mock-uuid-1",
              componentName: "module",
              props: {},
              metadataUUID: "mock-metadata",
            },
            {
              ...searchBarComponent,
              uuid: "mock-uuid-3",
              parentUUID: "mock-uuid-0",
            },
          ],
          cssImports: [],
          filepath: "mock-filepath",
        },
      },
      activePageName: "universal",
      activeComponentUUID: "mock-uuid-1",
    },
    fileMetadatas: {
      UUIDToFileMetadata: {
        test: {
          kind: FileMetadataKind.Module,
          componentTree: [],
          metadataUUID: "test",
          filepath: "src/modules/test.tsx",
        },
      },
    },
  });
});

it("does not render when there is no active page state", () => {
  useStudioStore.getState().pages.setActivePageName(undefined);
  render(<CreateModuleButton />);
  expect(screen.queryByRole("button")).toBeNull();
});

it("does not render when there is no active component state", () => {
  useStudioStore.getState().pages.setActiveComponentUUID(undefined);
  render(<CreateModuleButton />);
  expect(screen.queryByRole("button")).toBeNull();
});

it("does not render when the active component is a module", () => {
  useStudioStore.getState().pages.setActiveComponentUUID("mock-uuid-2");
  render(<CreateModuleButton />);
  expect(screen.queryByRole("button")).toBeNull();
});

it("gives an error if the module name is already used", async () => {
  render(<CreateModuleButton />);
  await userEvent.click(screen.getByRole("button"));
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(screen.getByText("Module name already used.")).toBeDefined();
});

it("gives an error if the module path is invalid", async () => {
  render(<CreateModuleButton />);
  await userEvent.click(screen.getByRole("button"));
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "../test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(screen.getByText("Module path is invalid.")).toBeDefined();
});

it("adds a module to file metadata mapping and updates component tree", async () => {
  const setFileMetadataSpy = jest.spyOn(
    useStudioStore.getState().fileMetadatas,
    "setFileMetadata"
  );
  render(<CreateModuleButton />);
  await userEvent.click(screen.getByRole("button"));
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "module");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(setFileMetadataSpy).toBeCalledWith(
    expect.stringMatching(/\/module.tsx$/),
    {
      kind: FileMetadataKind.Module,
      componentTree: [
        {
          ...searchBarComponent,
          uuid: "mock-uuid-1",
        },
        {
          kind: ComponentStateKind.Module,
          uuid: "mock-uuid-2",
          parentUUID: "mock-uuid-1",
          componentName: "module",
          props: {},
          metadataUUID: "mock-metadata",
        },
      ],
      filepath: expect.stringMatching(/\/module.tsx$/),
      metadataUUID: expect.stringMatching(/\/module.tsx$/),
    }
  );
  const moduleComponentState = {
    kind: ComponentStateKind.Module,
    uuid: expect.anything(),
    parentUUID: "mock-uuid-0",
    componentName: "module",
    metadataUUID: expect.stringMatching(/\/module.tsx$/),
    props: {},
  };
  expect(useStudioStore.getState().pages.getActivePageState()).toEqual({
    componentTree: [
      {
        kind: ComponentStateKind.Fragment,
        uuid: "mock-uuid-0",
      },
      moduleComponentState,
      {
        ...searchBarComponent,
        uuid: "mock-uuid-3",
        parentUUID: "mock-uuid-0",
      },
    ],
    cssImports: [],
    filepath: "mock-filepath",
  });
  expect(useStudioStore.getState().pages.getActiveComponentState()).toEqual(
    moduleComponentState
  );
  expect(screen.queryByText("Save")).toBeNull();
});
