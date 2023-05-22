import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import PageSettingsButton from "../../src/components/PageSettingsButton";
import { PageState, PropValueKind } from "@yext/studio-plugin";

const basePageState: PageState = {
  componentTree: [],
  cssImports: [],
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
        location: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
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
  const textbox = screen.getByRole("textbox");
  expect(textbox).toHaveValue("index");
});

it("disables the Save button if new getPath value is blank or matches original", async () => {
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox");
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
  const textbox = screen.getByRole("textbox");
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
  const textbox = screen.getByRole("textbox");
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

it("disables the button and has a tooltip when getPath value is undefined", () => {
  render(<PageSettingsButton pageName="location" />);
  const pageSettingsButton = screen.getByRole("button");
  expect(pageSettingsButton).toBeDisabled();
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "No settings available to edit via the UI."
  );
});
