import { render, screen } from "@testing-library/react";
import ActivePagePanel from "../../src/components/ActivePagePanel";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import { PageState, PropValueKind } from "@yext/studio-plugin";

const basePageState: PageState = {
  componentTree: [],
  cssImports: [],
  filepath: "mock-filepath",
};

it("displays ErrorPageStates in the ActivePagePanel with correct tooltips", () => {
  mockPageSliceStates({
    errorPages: {
      ErrorPage: {
        message: "This message is the reason the page could not be rendered",
      },
    },
  });
  render(<ActivePagePanel />);
  expect(screen.getByText("ErrorPage")).toBeTruthy();
  expect(screen.getByRole("tooltip")).toHaveTextContent(
    "This message is the reason the page could not be rendered"
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
