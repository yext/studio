import { render, screen } from "@testing-library/react";
import OpenLivePreviewButton, {
  PAGES_JS_LANDING_PAGE,
} from "../../src/components/OpenLivePreviewButton";
import mockActivePage from "../__utils__/mockActivePage";
import { PageState, PropValueKind } from "@yext/studio-plugin";
import mockStore from "../__utils__/mockStore";

const ensureButtonAppearance = (
  button: HTMLElement,
  shouldBeEnabled: boolean
) => {
  expect(button).toBeDefined();
  expect(button.textContent).toBe("Live Preview");
  shouldBeEnabled
    ? expect(button).toBeEnabled()
    : expect(button).toBeDisabled();
};

describe("button is disabled properly", () => {
  it("disables the button when there is no active page", () => {
    mockStore({
      pages: {
        getActivePageState: () => undefined,
        getActiveEntityData: () => undefined,
      },
    });

    render(<OpenLivePreviewButton />);
    const button = screen.getByRole("button");
    ensureButtonAppearance(button, false);
  });

  it("disables the button when active page is not a PagesJS Template", () => {
    const pageState: PageState = {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path.tsx",
    };
    mockActivePage(pageState);

    render(<OpenLivePreviewButton />);
    const button = screen.getByRole("button");
    ensureButtonAppearance(button, false);
  });

  it("disables the button for Static page without a valid GetPathVal", () => {
    const pageState: PageState = {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path.tsx",
      pagesJS: {
        getPathValue: undefined,
      },
    };
    mockActivePage(pageState);

    render(<OpenLivePreviewButton />);
    const button = screen.getByRole("button");
    ensureButtonAppearance(button, false);
  });

  it("when an Entity's localData doesn't contain an id, the button is disabled", () => {
    const pageState: PageState = {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path.tsx",
      pagesJS: {
        getPathValue: undefined,
        streamScope: {
          entityIds: ["abc"],
        },
      },
    };

    mockStore({
      pages: {
        activePageName: "testpage",
        pages: {
          testpage: pageState,
        },
        getActiveEntityData: () => {
          return {};
        },
      },
    });

    render(<OpenLivePreviewButton />);
    const button = screen.getByRole("button");
    ensureButtonAppearance(button, false);
  });
});

describe("button links to correct preview url", () => {
  window.open = jest.fn();

  it("preview url for Static Page is correct", () => {
    const pageState: PageState = {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path.tsx",
      pagesJS: {
        getPathValue: {
          kind: PropValueKind.Literal,
          value: "static-page",
        },
      },
    };
    mockActivePage(pageState);

    render(<OpenLivePreviewButton />);
    const button = screen.getByRole("button");
    ensureButtonAppearance(button, true);
    button.click();
    expect(window.open).toBeCalledWith(
      `${PAGES_JS_LANDING_PAGE}/static-page`,
      "_blank"
    );
  });

  it("preview url for Entity Page is correct", () => {
    const pageState: PageState = {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path.tsx",
      pagesJS: {
        getPathValue: undefined,
        streamScope: {
          entityIds: ["abc"],
        },
      },
    };

    mockStore({
      pages: {
        activePageName: "testpage",
        pages: {
          testpage: pageState,
        },
        getActiveEntityData: () => {
          return { id: "123" };
        },
      },
    });

    render(<OpenLivePreviewButton />);
    const button = screen.getByRole("button");
    ensureButtonAppearance(button, true);
    button.click();
    expect(window.open).toBeCalledWith(
      `${PAGES_JS_LANDING_PAGE}/testpage/123`,
      "_blank"
    );
  });
});
