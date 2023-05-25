import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPageButton from "../../../src/components/AddPageButton/AddPageButton";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";
import { PageState, PropValueKind } from "@yext/studio-plugin";

const basicPageState: PageState = {
  componentTree: [],
  cssImports: [],
  filepath: expect.stringContaining("test.tsx"),
};

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

async function specifyName() {
  const nameTextbox = screen.getByRole("textbox", {
    name: "Give the page a name:",
  });
  await userEvent.type(nameTextbox, "test");
}

it("closes the modal when a page name is added in a non-PagesJS repo", async () => {
  const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toBeDisabled();
  await specifyName();
  await userEvent.click(saveButton);
  expect(addPageSpy).toBeCalledWith("test", basicPageState);
  await waitFor(() => expect(screen.queryByText("Save")).toBeNull());
});

describe("PagesJS repo", () => {
  beforeEach(() => {
    const originalStudioConfig = useStudioStore.getState().studioConfig;
    mockStore({
      studioConfig: { ...originalStudioConfig, isPagesJSRepo: true },
    });
  });

  async function specifyUrl(url: string) {
    const urlTextbox = screen.getByRole("textbox", {
      name: "Specify the URL slug:",
    });
    await userEvent.type(urlTextbox, url);
  }

  it("closes modal when page type, name, and url are specified for static page", async () => {
    const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
    render(<AddPageButton />);

    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);

    const defaultRadioButton = screen.getByRole("radio", { checked: true });
    expect(defaultRadioButton).toHaveAttribute("name", "Static");
    const nextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(nextButton);

    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toBeDisabled();
    await specifyName();
    expect(saveButton).toBeDisabled();
    await specifyUrl("testing");
    await userEvent.click(saveButton);

    expect(addPageSpy).toBeCalledWith("test", {
      ...basicPageState,
      pagesJS: {
        getPathValue: { kind: PropValueKind.Literal, value: "testing" },
      },
    });
    await waitFor(() => expect(screen.queryByText("Save")).toBeNull());
  });

  describe("entity page", () => {
    async function selectEntityPageType() {
      const entityRadioButton = screen.getByRole("radio", { checked: false });
      expect(entityRadioButton).toHaveAttribute("name", "Entity");
      await userEvent.click(entityRadioButton);
      const nextButton = screen.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    }

    it("closes modal once page type, stream scope, name, and url are specified", async () => {
      const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
      render(<AddPageButton />);

      const addPageButton = screen.getByRole("button");
      await userEvent.click(addPageButton);

      await selectEntityPageType();

      const nextButton = screen.getByRole("button", { name: "Next" });
      const entityTypesTextbox = screen.getByRole("textbox", {
        name: "Entity Types:",
      });
      await userEvent.type(entityTypesTextbox, "location, restaurant");
      await userEvent.click(nextButton);

      const saveButton = screen.getByRole("button", { name: "Save" });
      expect(saveButton).toBeDisabled();
      await specifyName();
      expect(saveButton).toBeEnabled();
      await specifyUrl("-[[[[id]]");
      await userEvent.click(saveButton);

      expect(addPageSpy).toBeCalledWith("test", {
        ...basicPageState,
        pagesJS: {
          getPathValue: {
            kind: PropValueKind.Expression,
            value: "`${document.slug}-${document.id}`",
          },
          streamScope: { entityTypes: ["location", "restaurant"] },
        },
      });
      await waitFor(() => expect(screen.queryByText("Save")).toBeNull());
    });

    it("does not require changes to stream scope or url slug", async () => {
      const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
      render(<AddPageButton />);

      const addPageButton = screen.getByRole("button");
      await userEvent.click(addPageButton);

      await selectEntityPageType();

      const nextButton = screen.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);

      const saveButton = screen.getByRole("button", { name: "Save" });
      expect(saveButton).toBeDisabled();
      await specifyName();
      await userEvent.click(saveButton);

      expect(addPageSpy).toBeCalledWith("test", {
        ...basicPageState,
        pagesJS: {
          getPathValue: {
            kind: PropValueKind.Expression,
            value: "`${document.slug}`",
          },
          streamScope: {},
        },
      });
    });
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
