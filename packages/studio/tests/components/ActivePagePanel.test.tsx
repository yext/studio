import { render, screen, waitFor } from "@testing-library/react";
import ActivePagePanel from "../../src/components/ActivePagePanel";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import { PageState, PropValueKind } from "@yext/studio-plugin";
import { checkTooltipFunctionality } from "../__utils__/helpers";
import userEvent from "@testing-library/user-event";


const basePageState: PageState = {
  componentTree: [],
  cssImports: [],
  filepath: "mock-filepath",
};

it("displays ErrorPageStates in the ActivePagePanel with correct tooltips", async () => {
  mockPageSliceStates({
    errorPages: {
      ErrorPage: {
        message: "This message is the reason the page could not be rendered",
      },
    },
  });
  render(<ActivePagePanel />);
  expect(screen.getByText("ErrorPage")).toBeTruthy();
  const tooltipMessage =
    "This message is the reason the page could not be rendered";
  await checkTooltipFunctionality(
    tooltipMessage,
    screen.getByText("ErrorPage")
  );
});

it("does not render page settings button in non-PagesJS repo", () => {
  mockPageSliceStates({ pages: { Universal: basePageState } });
  render(<ActivePagePanel />);
  expect(
    screen.queryByRole("button", { name: "Edit Universal Page Settings" })
  ).toBeNull();
});

it("renders page settings button in PagesJS repo", () => {
  const originalStudioConfig = useStudioStore.getState().studioConfig;
  mockStore({
    pages: {
      pages: {
        Universal: {
          ...basePageState,
          pagesJS: {
            getPathValue: { kind: PropValueKind.Literal, value: "index" },
          },
        },
      },
    },
    studioConfig: {
      ...originalStudioConfig,
      isPagesJSRepo: true,
    },
  });
  render(<ActivePagePanel />);
  expect(
    screen.getByRole("button", { name: "Edit Universal Page Settings" })
  ).toBeDefined();
});

it("removes the page when page delete button is clicked", async () => {
  mockPageSliceStates({ pages: { Universal: basePageState } })
  const removePageSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "removePage"
  );
  render(<ActivePagePanel />);
  const removePageButton = screen.getByRole("button", {name: "Remove Element"});
  await userEvent.click(removePageButton);
  expect(useStudioStore.getState().pages.pages["Universal"]).toBeDefined();
  const deleteButton = screen.getByRole("button", { name: "Delete" });
  await userEvent.click(deleteButton);
  expect(removePageSpy).toBeCalledWith("Universal");
  await waitFor(() => expect(screen.queryByText("Delete")).toBeNull());
  expect(useStudioStore.getState().pages.pages["Universal"]).toBeUndefined();
});
