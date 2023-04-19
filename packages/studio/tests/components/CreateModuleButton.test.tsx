import { render, screen } from "@testing-library/react";
import CreateModuleButton from "../../src/components/ModuleActions/CreateModuleButton";
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
        "Testy-metadata-uuid": {
          kind: FileMetadataKind.Module,
          componentTree: [],
          metadataUUID: "Testy-metadata-uuid",
          filepath: "src/modules/Testy.tsx",
        },
      },
    },
  });
});

it("does not render when there is no active page state", async () => {
  await useStudioStore.getState().actions.updateActivePage(undefined);
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
  await userEvent.type(textbox, "Testy");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(
    screen.getByText(
      'Error creating module: module name "Testy" is already used.'
    )
  ).toBeDefined();
});

it("gives an error if the module path is invalid", async () => {
  render(<CreateModuleButton />);
  await userEvent.click(screen.getByRole("button"));
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "../Test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(
    screen.getByText(
      'Error creating module: modulePath is invalid: "../Test.tsx".'
    )
  ).toBeDefined();
});

it("closes the modal when a module is successfully created", async () => {
  const createModuleSpy = jest.spyOn(useStudioStore.getState(), "createModule");
  render(<CreateModuleButton />);
  await userEvent.click(screen.getByRole("button"));
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "Module");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(createModuleSpy).toBeCalledWith("Module");
  expect(screen.queryByText("Save")).toBeNull();
});
