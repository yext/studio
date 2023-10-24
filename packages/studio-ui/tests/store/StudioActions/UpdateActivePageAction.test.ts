import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

it("updates the active page and sets the entity file", async () => {
  const page = {
    componentTree: [],
    styleImports: [],
    filepath: "unused",
  };
  mockStore({
    pages: {
      activePageName: "FirstPage",
      pages: {
        FirstPage: page,
        OtherPage: {
          ...page,
          pagesJS: {
            entityFiles: ["entityFile.json"],
            getPathValue: undefined,
          },
        },
      },
    },
  });
  expect(useStudioStore.getState().pages.activeEntityFile).toBeUndefined();
  expect(useStudioStore.getState().pages.activePageEntities).toBeUndefined();
  await useStudioStore.getState().actions.updateActivePage("OtherPage");
  expect(useStudioStore.getState().pages.activeEntityFile).toEqual(
    "entityFile.json"
  );
  expect(useStudioStore.getState().pages.activePageEntities).toEqual({
    "entityFile.json": {
      employeeCount: 123,
      favs: ["cat", "dog", "sleep"],
      name: "bob",
    },
  });
});
