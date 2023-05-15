import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPageButton from "../../src/components/AddPageButton";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import { PropValueKind } from "@yext/studio-plugin";

beforeEach(() => {
  mockStore({
    pages: {
      pages: {
        universal: {
          componentTree: [],
          cssImports: [],
          filepath: "mock-filepath",
        },
      },
    },
  });
});

it("closes the modal when a page name is added in a non-PagesJS repo", async () => {
  const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(addPageSpy).toBeCalledWith("test", {
    componentTree: [],
    cssImports: [],
    filepath: expect.stringContaining("test.tsx"),
  });
  expect(screen.queryByText("Save")).toBeNull();
});

it("closes the modal when page name and url are added in PagesJS repo", async () => {
  const originalStudioConfig = useStudioStore.getState().studioConfig;
  mockStore({ studioConfig: { ...originalStudioConfig, isPagesJSRepo: true } });
  const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
  render(<AddPageButton />);

  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const nameTextbox = screen.getByRole("textbox", {
    name: "Give the page a name:",
  });
  await userEvent.type(nameTextbox, "test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toBeDisabled();
  const urlTextbox = screen.getByRole("textbox", {
    name: "Specify the URL slug:",
  });
  await userEvent.type(urlTextbox, "testing");
  await userEvent.click(saveButton);

  expect(addPageSpy).toBeCalledWith("test", {
    componentTree: [],
    cssImports: [],
    filepath: expect.stringContaining("test.tsx"),
    pagesJS: {
      getPathValue: { kind: PropValueKind.Literal, value: "testing" },
    },
  });
  expect(screen.queryByText("Save")).toBeNull();
});

it("gives an error if the page name is already used", async () => {
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "universal");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(
    screen.getByText(
      'Error adding page: page name "universal" is already used.'
    )
  ).toBeDefined();
});

it("gives an error if the page path is invalid", async () => {
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "../test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(
    screen.getByText("Error adding page: pageName is invalid: ../test")
  ).toBeDefined();
});
