import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPageButton from "../../../src/components/AddPageButton/AddPageButton";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";
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
  await waitFor(() => expect(screen.queryByText("Save")).toBeNull());
});

describe("PagesJS repo", () => {
  it("closes the modal when page type, name, and url are specified for a static page", async () => {
    const originalStudioConfig = useStudioStore.getState().studioConfig;
    mockStore({
      studioConfig: { ...originalStudioConfig, isPagesJSRepo: true },
    });
    const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
    render(<AddPageButton />);

    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);

    const defaultRadioButton = screen.getByRole("radio", { checked: true });
    expect(defaultRadioButton).toHaveAttribute("name", "Static");
    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);

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
    await waitFor(() => expect(screen.queryByText("Save")).toBeNull());
  });
});

describe("errors", () => {
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
});
