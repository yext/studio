import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UndoRedo from "../../src/components/UndoRedo";
import useStudioStore from "../../src/store/useStudioStore";
import useTemporalStore from "../../src/store/useTemporalStore";
import { searchBarComponent } from "../__fixtures__/componentStates";
import mockStore from "../__utils__/mockStore";

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
    render(<UndoRedo />);
    expect(useStudioStore.getState().pages.activeComponentUUID).toBe(
      "searchbar-uuid"
    );
    await userEvent.click(screen.getByLabelText("Undo"));
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
  });

  it("redoes single state update when redo is clicked", async () => {
    const undo = useTemporalStore((store) => store.undo);
    undo();
    undo();
    render(<UndoRedo />);
    expect(useStudioStore.getState().pages.activePageName).toBeUndefined();
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
    await userEvent.click(screen.getByLabelText("Redo"));
    expect(useStudioStore.getState().pages.activePageName).toBe("universal");
    expect(useStudioStore.getState().pages.activeComponentUUID).toBeUndefined();
  });
});
