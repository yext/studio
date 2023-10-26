import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import PageSettingsButton from "../../src/components/PageSettingsButton/PageSettingsButton";
import { PageState, PropValueKind } from "@yext/studio-plugin";

const basePageState: PageState = {
  componentTree: [],
  styleImports: [],
  filepath: "mock-filepath",
};

beforeEach(() => {
  const originalStudioConfig = useStudioStore.getState().studioConfig;
  mockStore({
    pages: {
      pages: {
        universal: {
          ...basePageState,
          pagesJS: {
            getPathValue: { kind: PropValueKind.Literal, value: "index" },
          },
        },
        product: {
          ...basePageState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "document.slug",
            },
            streamScope: {},
          },
        },
        index: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
          },
        },
        fruits: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
            streamScope: {
              entityIds: ["apple", "orange"],
              savedFilterIds: ["banana"],
            },
          },
        },
        invalid_slug: {
          ...basePageState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "iaminvalid<>||||$|{document.no}",
            },
            streamScope: {},
          },
        },
      },
    },
    studioConfig: {
      ...originalStudioConfig,
      isPagesJSRepo: true,
    },
  });
});

it("displays the original getPath value when the modal is opened", async () => {
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  expect(textbox).toHaveValue("index");
});

it("disables the Save button if new getPath value is blank or matches original", async () => {
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  await userEvent.clear(textbox);
  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toBeDisabled();
  await userEvent.type(textbox, "in");
  expect(saveButton).toBeEnabled();
  await userEvent.type(textbox, "dex");
  expect(saveButton).toBeDisabled();
});

it("closes the modal when the getPath value is updated", async () => {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  await userEvent.type(textbox, ".html");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateGetPathValueSpy).toBeCalledWith("universal", {
    kind: PropValueKind.Literal,
    value: "index.html",
  });
  expect(screen.queryByText("Save")).toBeNull();
});

it("updates getPath value with square and curly bracket expression", async () => {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName="product" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  expect(textbox).toHaveValue("[[slug]]");
  // userEvent treats `[` and `{` as special characters. To type each in the
  // input, the character must be doubled in the string.
  await userEvent.type(textbox, "-[[[[services[[0]]]-${{document.id}");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateGetPathValueSpy).toBeCalledWith("product", {
    kind: PropValueKind.Expression,
    value: "`${document.slug}-${document.services[0]}-${document.id}`",
  });
});

async function cannotEditURL(pageName: string) {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName={pageName} />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const urlTextbox = screen.getByPlaceholderText(
    "<URL slug is not editable in Studio. Consult a developer>"
  );
  expect(urlTextbox).toBeDisabled();
  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toBeDisabled();
  expect(updateGetPathValueSpy).toBeCalledTimes(0);
}

it("displays URL placeholder and cannot edit URL when static page's getPath value is undefined", async () => {
  await cannotEditURL("index");
});

it("displays URL placeholder and cannot edit URL when entity page's getPath value is undefined", async () => {
  await cannotEditURL("fruits");
});

it("displays URL placeholder and cannot edit URL when entity page's getPath value is invalid", async () => {
  await cannotEditURL("invalid_slug");
});

it("throws an error when user enters an invalid URL slug and allows user to fix", async () => {
  render(<PageSettingsButton pageName="product" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const urlTextbox = screen.getByRole("textbox", { name: "URL Slug" });
  expect(urlTextbox).toHaveValue("[[slug]]");
  await userEvent.type(urlTextbox, "{backspace}");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(saveButton).toBeDisabled();
  expect(
    screen.getByText("URL slug contains invalid characters: []")
  ).toBeDefined();
  await userEvent.type(urlTextbox, "]-[[field]]");
  expect(
    screen.queryByText("URL slug contains invalid characters: []")
  ).toBeNull();
  expect(saveButton).toBeEnabled();
});
