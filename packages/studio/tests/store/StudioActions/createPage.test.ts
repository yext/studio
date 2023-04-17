import useStudioStore from "../../../src/store/useStudioStore";

it("gives an error for a relative filepath", async () => {
  const createPage = useStudioStore.getState().actions.createPage("../test");
  await expect(createPage).rejects.toThrow(
    "Error adding page: pageName is invalid: ../test"
  );
});

it("gives an error for an empty string pagename", async () => {
  const createPage = useStudioStore.getState().actions.createPage("");
  await expect(createPage).rejects.toThrow(
    "Error adding page: a pageName is required."
  );
});

it("adds the new page name to pagesToUpdate", async () => {
  await useStudioStore.getState().actions.createPage("test");
  const pagesToUpdate =
    useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
  expect(pagesToUpdate).toEqual(new Set(["test"]));
});

it("adds a page to pages and updates the active page to the new one", async () => {
  await useStudioStore.getState().actions.createPage("test");
  const pagesRecord = useStudioStore.getState().pages.pages;
  expect(pagesRecord).toEqual({
    test: {
      componentTree: [],
      cssImports: [],
      filepath: expect.stringContaining("test"),
    },
  });
  expect(useStudioStore.getState().pages.activePageName).toEqual("test");
});
