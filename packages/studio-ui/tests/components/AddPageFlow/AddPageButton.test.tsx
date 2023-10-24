import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPageButton from "../../../src/components/AddPageButton/AddPageButton";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";
import {
  ComponentStateKind,
  LayoutState,
  PageState,
  PropValueKind,
  ResponseType,
} from "@yext/studio-plugin";
import * as sendMessageModule from "../../../src/messaging/sendMessage";

const basicPageState: PageState = {
  componentTree: [],
  styleImports: [],
  filepath: expect.stringContaining("test.tsx"),
};

const mockLayout: LayoutState = {
  componentTree: [
    {
      kind: ComponentStateKind.Standard,
      componentName: "mockComponentName",
      props: {},
      uuid: "mockUUID",
      metadataUUID: "mockMetadataUUID",
    },
  ],
  styleImports: [],
  filepath: "mockLayoutFilepath",
};

beforeEach(() => {
  mockStore({
    pages: {
      pages: {
        universal: {
          componentTree: [],
          styleImports: [],
          filepath: "mockFilepath",
        },
      },
    },
    layouts: {
      layoutNameToLayoutState: {
        mockLayout: mockLayout,
      },
    },
  });
});

async function specifyName() {
  const nameTextbox = screen.getByRole("textbox", {
    name: "Page Name",
  });
  await userEvent.type(nameTextbox, "test");
}

async function selectLayoutAndSave(layoutName: string) {
  await userEvent.selectOptions(
    screen.getByRole("combobox"),
    screen.getByRole("option", { name: layoutName })
  );
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
}

it("closes the modal after completing page name and layout modals in a non-PagesJS repo", async () => {
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const basicPageDataNextButton = screen.getByRole("button", { name: "Next" });
  expect(basicPageDataNextButton).toBeDisabled();
  await specifyName();
  await userEvent.click(basicPageDataNextButton);
  await selectLayoutAndSave("mockLayout");
  await waitFor(() => expect(screen.queryByText("Save")).toBeNull());
  expect(useStudioStore.getState().pages.pages["test"]).toEqual({
    ...basicPageState,
    componentTree: mockLayout.componentTree,
    styleImports: mockLayout.styleImports,
  });
});

describe("PagesJS repo", () => {
  beforeEach(() => {
    const originalStudioConfig = useStudioStore.getState().studioConfig;
    mockStore({
      studioConfig: { ...originalStudioConfig, isPagesJSRepo: true },
      accountContent: {
        savedFilters: [],
        entitiesRecord: {
          location: { entities: [], totalCount: 1 },
          restaurant: { entities: [], totalCount: 1 },
        },
      },
    });
  });

  async function specifyUrl(url: string) {
    const urlTextbox = screen.getByRole("textbox", {
      name: "URL Slug",
    });
    await userEvent.type(urlTextbox, url);
  }

  it("closes modal after page type, name, and layout for static page", async () => {
    jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
      return new Promise((resolve) =>
        resolve({
          msg: "msg",
          type: ResponseType.Success,
          mappingJson: {
            test: ["mockLocalData.json"],
          },
        })
      );
    });
    render(<AddPageButton />);

    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);

    const defaultRadioButton = screen.getByRole("radio", { checked: true });
    expect(defaultRadioButton).toHaveAttribute("name", "Static");
    const pageTypeNextButton = screen.getByRole("button", { name: "Next" });
    await userEvent.click(pageTypeNextButton);

    const basicPageDataNextButton = screen.getByRole("button", {
      name: "Next",
    });
    expect(basicPageDataNextButton).toBeDisabled();
    await specifyName();
    expect(basicPageDataNextButton).toBeDisabled();
    await specifyUrl("testing");
    await userEvent.click(basicPageDataNextButton);
    await selectLayoutAndSave("mockLayout");
    expect(useStudioStore.getState().pages.pages["test"]).toEqual({
      ...basicPageState,
      pagesJS: {
        getPathValue: {
          kind: PropValueKind.Literal,
          value: "testing",
        },
        entityFiles: ["mockLocalData.json"],
      },
      componentTree: mockLayout.componentTree,
      styleImports: mockLayout.styleImports,
    });

    await waitFor(() => expect(screen.queryByText("Save")).toBeNull());

    expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
      "mockLocalData.json"
    );
    expect(useStudioStore.getState().pages.getActiveEntityData()).toEqual({
      __: expect.anything(),
    });
  });

  describe("entity page", () => {
    async function selectEntityPageType() {
      const entityRadioButton = screen.getByRole("radio", { checked: false });
      expect(entityRadioButton).toHaveAttribute("name", "Entity");
      await userEvent.click(entityRadioButton);
      const nextButton = screen.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    }

    it("closes modal once page type, stream scope, name, url, and layout are specified", async () => {
      render(<AddPageButton />);
      jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
        return new Promise((resolve) =>
          resolve({
            msg: "msg",
            type: ResponseType.Success,
            mappingJson: {
              test: ["mockLocalData.json"],
            },
          })
        );
      });

      const addPageButton = screen.getByRole("button");
      await userEvent.click(addPageButton);

      await selectEntityPageType();

      const streamScopeNextButton = screen.getByRole("button", {
        name: "Next",
      });
      const entityTypesPicker = screen.getByRole("button", {
        name: "Toggle pill picker",
      });
      await userEvent.click(entityTypesPicker);
      await userEvent.click(
        within(screen.getByRole("list")).getByText("location")
      );
      await userEvent.click(
        within(screen.getByRole("list")).getByText("restaurant")
      );
      await userEvent.click(streamScopeNextButton);

      const basicPageDataNextButton = screen.getByRole("button", {
        name: "Next",
      });
      expect(basicPageDataNextButton).toBeDisabled();
      await specifyName();
      expect(basicPageDataNextButton).toBeEnabled();
      await specifyUrl("-[[[[id]]");
      await userEvent.click(basicPageDataNextButton);

      await selectLayoutAndSave("mockLayout");

      expect(useStudioStore.getState().pages.pages["test"]).toEqual({
        ...basicPageState,
        pagesJS: {
          getPathValue: {
            kind: PropValueKind.Expression,
            value: "`${document.slug}-${document.id}`",
          },
          streamScope: { entityTypes: ["location", "restaurant"] },
          entityFiles: ["mockLocalData.json"],
        },
        componentTree: mockLayout.componentTree,
        styleImports: mockLayout.styleImports,
      });
      await waitFor(() => expect(screen.queryByText("Save")).toBeNull());

      expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
        "mockLocalData.json"
      );
      expect(useStudioStore.getState().pages.getActiveEntityData()).toEqual({
        __: expect.anything(),
      });
    });

    it("does not require changes to stream scope, url slug, or layout", async () => {
      render(<AddPageButton />);
      jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
        return new Promise((resolve) =>
          resolve({
            msg: "msg",
            type: ResponseType.Success,
            mappingJson: {
              test: ["mockLocalData.json"],
            },
          })
        );
      });

      const addPageButton = screen.getByRole("button");
      await userEvent.click(addPageButton);

      await selectEntityPageType();

      const streamScopeNextButton = screen.getByRole("button", {
        name: "Next",
      });
      await userEvent.click(streamScopeNextButton);

      const basicPageDataNextButton = screen.getByRole("button", {
        name: "Next",
      });
      expect(basicPageDataNextButton).toBeDisabled();
      await specifyName();
      await userEvent.click(basicPageDataNextButton);

      const saveButton = screen.getByRole("button", { name: "Save" });
      await userEvent.click(saveButton);

      expect(useStudioStore.getState().pages.pages["test"]).toEqual({
        ...basicPageState,
        pagesJS: {
          getPathValue: {
            kind: PropValueKind.Expression,
            value: "`${document.slug}`",
          },
          streamScope: {},
          entityFiles: ["mockLocalData.json"],
        },
      });
      await waitFor(() => expect(screen.queryByText("Save")).toBeNull());

      expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
        "mockLocalData.json"
      );
      expect(useStudioStore.getState().pages.getActiveEntityData()).toEqual({
        __: expect.anything(),
      });
    });

    it("gives an error if the URL slug contains document expression and is invalid", async () => {
      render(<AddPageButton />);
      const addPageButton = screen.getByRole("button");
      await userEvent.click(addPageButton);
      await selectEntityPageType();
      const pageTypeNextButton = screen.getByRole("button", { name: "Next" });
      await userEvent.click(pageTypeNextButton);
      await userEvent.click(pageTypeNextButton);
      await specifyName();
      await specifyUrl("=<>[[[[field]]");
      const basicPageDataNextButton = screen.getByRole("button", {
        name: "Next",
      });
      await userEvent.click(basicPageDataNextButton);

      expect(
        screen.getByText("URL slug contains invalid characters: <>")
      ).toBeDefined();
      expect(basicPageDataNextButton).toBeDisabled();
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
    const basicPageDataNextButton = screen.getByRole("button", {
      name: "Next",
    });
    await userEvent.click(basicPageDataNextButton);
    expect(
      screen.getByText('Page name "universal" is already used.')
    ).toBeDefined();
  });

  it("gives an error if the page path is invalid", async () => {
    render(<AddPageButton />);
    const addPageButton = screen.getByRole("button");
    await userEvent.click(addPageButton);
    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "***");
    const basicPageDataNextButton = screen.getByRole("button", {
      name: "Next",
    });
    await userEvent.click(basicPageDataNextButton);
    expect(
      screen.getByText("Page name cannot contain the characters: *")
    ).toBeDefined();
  });
});
