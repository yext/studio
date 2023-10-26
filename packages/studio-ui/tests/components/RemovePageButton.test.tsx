import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RemovePageButton from "../../src/components/RemovePageButton";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";

beforeEach(() => {
  mockStore({
    pages: {
      pages: {
        universal: {
          componentTree: [],
          styleImports: [],
          filepath: "mock-filepath",
        },
      },
    },
  });
});

it("removes selected page from store and closes the modal after confirmation", async () => {
  const removePageSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "removePage"
  );
  render(<RemovePageButton pageName="universal" />);
  const removePageButton = screen.getByRole("button");
  await userEvent.click(removePageButton);
  expect(useStudioStore.getState().pages.pages["universal"]).toBeDefined();
  const deleteButton = screen.getByRole("button", { name: "Delete" });
  await userEvent.click(deleteButton);
  expect(removePageSpy).toBeCalledWith("universal");
  await waitFor(() => expect(screen.queryByText("Delete")).toBeNull());
  expect(useStudioStore.getState().pages.pages["universal"]).toBeUndefined();
});
