import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActionsBar from "../../src/components/ActionsBar";
import useStudioStore from "../../src/store/useStudioStore";
import useTemporalStore from "../../src/store/useTemporalStore";
import { searchBarComponent } from "../__fixtures__/componentStates";
import mockStore from "../__utils__/mockStore";

jest.mock("../../src/icons/undo.svg", () => {
  return { ReactComponent: "svg" };
});

describe("Undo/redo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockStore({
      pages: {
        pages: {
          universal: {
            componentTree: [searchBarComponent],
            cssImports: [],
            filepath: "mock-filepath",
          },
        },
        activePageName: undefined,
        activeComponentUUID: undefined,
      },
    });
    jest.advanceTimersByTime(500);
    mockStore({
      pages: {
        activePageName: "universal",
      },
    });
    jest.advanceTimersByTime(500);
    mockStore({
      pages: {
        activeComponentUUID: "searchbar-uuid",
      },
    });
    jest.useRealTimers();
  });

  it("undoes last state update when undo is clicked", async () => {
    render(<ActionsBar />);
    expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
      "searchbar-uuid"
    );
    await userEvent.click(screen.getByLabelText("Undo"));
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
  });

  it("redoes single state update when redo is clicked", async () => {
    useTemporalStore().undo();
    useTemporalStore().undo();
    render(<ActionsBar />);
    expect(useStudioStore.getState().pages.activePageName).toBeUndefined();
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
    await userEvent.click(screen.getByLabelText("Redo"));
    expect(useStudioStore.getState().pages.activePageName).toBe("universal");
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
  });
});
