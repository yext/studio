import { render, screen } from "@testing-library/react";
import { PageSliceStates } from "../../src/store/models/slices/PageSlice";
import { mockPageSliceStates } from "../__utils__/mockPageSliceState";
import EntityPicker from "../../src/components/EntityPicker";
import useStudioStore from "../../src/store/useStudioStore";
import userEvent from "@testing-library/user-event";

const initialState: Partial<PageSliceStates> = {
  pages: {
    entity: {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path",
      pagesJS: {
        entityFiles: ["entityFile-1.json", "entityFile-2.json"],
        getPathValue: undefined,
        streamScope: {},
      },
    },
    static: {
      componentTree: [],
      styleImports: [],
      filepath: "some/file/path",
      pagesJS: {
        entityFiles: ["mockLocalData.json"],
        getPathValue: undefined,
      },
    },
  },
  activePageName: "entity",
  activeEntityFile: "entityFile-1.json",
  activePageEntities: {
    "entityFile-1.json": {
      id: "entity-1",
      name: "Entity 1",
    },
    "entityFile-2.json": {
      id: "entity-2",
      name: "Entity 2",
    },
  },
};

beforeEach(() => {
  mockPageSliceStates(initialState);
});

it("does not render if there are no active page entities", async () => {
  await useStudioStore.getState().actions.updateActivePage();
  const { container } = render(<EntityPicker />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render if the page is not an entity page", async () => {
  await useStudioStore.getState().actions.updateActivePage("static");
  const { container } = render(<EntityPicker />);
  expect(container).toBeEmptyDOMElement();
});

it("correctly renders dropdown for entity page", () => {
  render(<EntityPicker />);
  expect(screen.getByLabelText("Entity")).toHaveValue("entityFile-1.json");
  expect(screen.getByText("Entity 1 (id: entity-1)")).toBeDefined();
  expect(screen.getByText("Entity 2 (id: entity-2)")).toBeDefined();
});

it("can update active entity using dropdown", async () => {
  render(<EntityPicker />);
  expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
    "entityFile-1.json"
  );
  const entitySelector = screen.getByLabelText("Entity");
  await userEvent.selectOptions(entitySelector, "entityFile-2.json");
  expect(entitySelector).toHaveValue("entityFile-2.json");
  expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
    "entityFile-2.json"
  );
});
