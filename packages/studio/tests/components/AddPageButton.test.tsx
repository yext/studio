import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPageButton from "../../src/components/AddPageButton";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";

jest.mock("../../src/icons/plus.svg", () => {
  return { ReactComponent: "svg" };
});

jest.mock("../../src/icons/x.svg", () => {
  return { ReactComponent: "svg" };
});

describe("AddPageButton", () => {
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

  it("closes the modal when a page name is successfully added", async () => {
    const setActivePageNameSpy = jest.spyOn(
      useStudioStore.getState().pages,
      "setActivePageName"
    );
    render(<AddPageButton />);
    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);
    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "test");
    const saveButton = screen.getByText<HTMLButtonElement>("Save");
    await userEvent.click(saveButton);
    expect(setActivePageNameSpy).toBeCalledWith("test");
    expect(screen.queryByText("Save")).toBeNull();
  });

  it("gives an error if the page name is already used", async () => {
    render(<AddPageButton />);
    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);
    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "universal");
    const saveButton = screen.getByText<HTMLButtonElement>("Save");
    await userEvent.click(saveButton);
    expect(screen.getByText("Page name already used.")).toBeDefined();
  });

  it("gives an error if the page path is invalid", async () => {
    render(<AddPageButton />);
    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);
    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "../test");
    const saveButton = screen.getByText<HTMLButtonElement>("Save");
    await userEvent.click(saveButton);
    expect(screen.getByText("Page path is invalid.")).toBeDefined();
  });
});
