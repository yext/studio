import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import { PageState, ResponseType } from "@yext/studio-plugin";
import { checkTooltipFunctionality } from "../__utils__/helpers";
import * as sendMessageModule from "../../src/messaging/sendMessage";
import { StudioStore } from "../../src/store/models/StudioStore";
import EditStreamScopeButton from "../../src/components/EditStreamScopeButton";

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
        fruits: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
            streamScope: {
              entityTypes: ["favoriteFruits"],
            },
          },
        },
        tooManyFruits: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
            streamScope: {
              entityIds: ["apple", "orange"],
              entityTypes: ["favoriteFruits"],
            },
          },
        },
      },
    },
    studioConfig: {
      ...originalStudioConfig,
      isPagesJSRepo: true,
    },
    accountContent: {
      entitiesRecord: {
        favoriteFruits: {
          entities: [
            {
              id: "apple",
              displayName: "apple",
            },
            {
              id: "orange",
              displayName: "orange",
            },
          ],
          totalCount: 1,
        },
      },
      savedFilters: [
        {
          id: "berries",
          displayName: "berries",
        },
      ],
    },
  });
});

it("displays the correct stream scope when modal opens", async () => {
  render(<EditStreamScopeButton pageName="fruits" />);
  const streamScopeButton = screen.getByRole("button");
  await userEvent.click(streamScopeButton);
  const entityTypeSelection = screen.getByRole("button", {
    name: "favoriteFruits",
  });
  expect(entityTypeSelection).toBeDefined();
});

it("updates stream scope with user input and regenerates test data for entity page", async () => {
  const updateStreamScopeSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateStreamScope"
  );
  render(<EditStreamScopeButton pageName="fruits" />);
  const streamScopeButton = screen.getByRole("button");
  await userEvent.click(streamScopeButton);
  const removeSelectedEntityType = screen.getByRole("button", {
    name: "favoriteFruits",
  });
  await userEvent.click(removeSelectedEntityType);
  const saveFilterDropdownButton =
    screen.getAllByLabelText("Toggle pill picker")[1];
  await userEvent.click(saveFilterDropdownButton);
  const savedFilter = screen.getByText("berries (id: berries)");
  await userEvent.click(savedFilter);

  function getEntityFiles(store: StudioStore) {
    return store.pages.pages["fruits"].pagesJS?.entityFiles;
  }

  expect(getEntityFiles(useStudioStore.getState())).toBeUndefined();
  jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
    return new Promise((resolve) =>
      resolve({
        msg: "msg",
        type: ResponseType.Success,
        mappingJson: {
          fruits: ["mockLocalData.json"],
        },
      })
    );
  });

  const confirmButton = screen.getByRole("button", { name: "Confirm" });
  await userEvent.click(confirmButton);
  expect(updateStreamScopeSpy).toBeCalledWith("fruits", {
    savedFilterIds: ["berries"],
  });
  expect(useStudioStore.getState().pages.activeEntityFile).toBeUndefined();
  expect(getEntityFiles(useStudioStore.getState())).toEqual([
    "mockLocalData.json",
  ]);

  await userEvent.click(streamScopeButton);
  expect(savedFilter).toBeDefined();
});

it("shows a tooltip when hovering over the label", async () => {
  const entityIdsMessage =
    "In the Yext platform, navigate to Content > Entities";
  const entityTypesMessage =
    "In the Yext platform, navigate to Content > Configuration > Entity Types";
  const savedFilterIdsMessage =
    "In the Yext platform, navigate to Content > Configuration > Saved Filters";
  render(<EditStreamScopeButton pageName="fruits" />);
  const streamScopeButton = screen.getByRole("button");
  await userEvent.click(streamScopeButton);
  await checkTooltipFunctionality(
    entityIdsMessage,
    screen.getByText("Entity IDs")
  );
  await checkTooltipFunctionality(
    entityTypesMessage,
    screen.getByText("Entity Type IDs")
  );
  await checkTooltipFunctionality(
    savedFilterIdsMessage,
    screen.getByText("Saved Filter IDs")
  );
});
