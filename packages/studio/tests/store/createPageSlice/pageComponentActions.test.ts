import useStudioStore from "../../../src/store/useStudioStore";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import {
  searchBarComponent,
  resultsComponent,
  containerComponent,
  child1Component,
  child2Component,
  resultsChildComponent,
  buttonComponent,
} from "../../__fixtures__/componentStates";
import { ComponentState } from "@yext/studio-plugin";
import { domRect } from "../../__utils__/helpers";

describe("PageSlice: page component actions", () => {
  describe("active component actions", () => {
    beforeEach(() => {
      mockPageSliceStates({
        pages: {
          universal: {
            componentTree: [searchBarComponent, resultsComponent],
            cssImports: [],
            filepath: "mock-filepath",
          },
        },
        activePageName: "universal",
        activeComponentUUID: "results-uuid",
      });
    });

    it("updates activeComponentUUID using setActiveComponentUUID", () => {
      useStudioStore.getState().pages.setActiveComponentUUID("searchbar-uuid");
      const activeComponentUUID =
        useStudioStore.getState().pages.activeComponentUUID;
      expect(activeComponentUUID).toEqual("searchbar-uuid");
    });

    it("returns active component using getActiveComponentState", () => {
      const activeComponent = useStudioStore
        .getState()
        .actions.getActiveComponentState();
      expect(activeComponent).toEqual(resultsComponent);
    });

    it("returns undefined when using getActiveComponentState before an active component is set in store", () => {
      mockPageSliceStates({
        pages: {
          universal: {
            componentTree: [searchBarComponent],
            cssImports: [],
            filepath: "mock-filepath",
          },
        },
        activePageName: "universal",
        activeComponentUUID: undefined,
      });
      const activeComponent = useStudioStore
        .getState()
        .actions.getActiveComponentState();
      expect(activeComponent).toEqual(undefined);
    });
  });

  describe("selected components actions", () => {
    const store = useStudioStore.getState;
    function shiftSelect(
      activeUUID: string,
      selectedComponent: ComponentState,
      expectedUUIDSelection: string[]
    ) {
      store().pages.clearSelectedComponents();
      store().pages.setActiveComponentUUID(activeUUID);
      store().pages.addShiftSelectedComponentUUIDs(selectedComponent);
      const selectedComponentUUIDs = store().pages.selectedComponentUUIDs;
      expect(selectedComponentUUIDs).toEqual(expectedUUIDSelection);
    }

    beforeEach(() => {
      mockPageSliceStates({
        pages: {
          universal: {
            componentTree: [
              searchBarComponent,
              resultsComponent,
              containerComponent,
              child1Component,
              child2Component,
              buttonComponent,
            ],
            cssImports: [],
            filepath: "mock-filepath",
          },
        },
        activePageName: "universal",
        activeComponentUUID: "results-uuid",
        selectedComponentUUIDs: ["results-uuid"],
        selectedComponentRects: [domRect(1, 2, 3, 4)],
      });
    });

    it("adds a selected component UUID using addSelectedComponentUUID", () => {
      store().pages.addSelectedComponentUUID("searchbar-uuid");
      const selectedComponentUUIDs = store().pages.selectedComponentUUIDs;
      expect(selectedComponentUUIDs).toEqual([
        "results-uuid",
        "searchbar-uuid",
      ]);
    });

    it("adds a selected component Rect using addSelectedComponentRect", () => {
      store().pages.addSelectedComponentRect(domRect(5, 6, 7, 8));
      const selectedComponentRects = store().pages.selectedComponentRects;
      expect(selectedComponentRects).toEqual([
        domRect(1, 2, 3, 4),
        domRect(5, 6, 7, 8),
      ]);
    });

    it("clears all selected component UUIDs and Rects using clearSelectedComponents", () => {
      store().pages.clearSelectedComponents();
      const [selectedComponentUUIDs, selectedComponentRects] = [
        store().pages.selectedComponentUUIDs,
        store().pages.selectedComponentRects,
      ];
      expect(selectedComponentUUIDs).toEqual([]);
      expect(selectedComponentRects).toEqual([]);
    });

    it("shift selects components after the active component", () => {
      const expectedUUIDSelection = [
        "results-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
        "button-uuid",
      ];
      shiftSelect("results-uuid", buttonComponent, expectedUUIDSelection);
    });

    it("shift selects components before the active component", () => {
      const expectedUUIDSelection = [
        "results-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
        "button-uuid",
      ];
      shiftSelect("button-uuid", resultsComponent, expectedUUIDSelection);
    });

    it("shift selects between levels", () => {
      const expectedUUIDSelection = [
        "searchbar-uuid",
        "results-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
      ];
      shiftSelect("searchbar-uuid", child1Component, expectedUUIDSelection);
    });

    it("shift selects all the children within a container", () => {
      const expectedUUIDSelection = ["child1-uuid", "child2-uuid"];
      shiftSelect("child1-uuid", child2Component, expectedUUIDSelection);
    });

    it("shift selects between two children components with different parents", () => {
      mockPageSliceStates({
        pages: {
          universal: {
            componentTree: [
              resultsComponent,
              resultsChildComponent,
              buttonComponent,
              containerComponent,
              child1Component,
              child2Component,
            ],
            cssImports: [],
            filepath: "mock-filepath",
          },
        },
        activePageName: "universal",
        activeComponentUUID: undefined,
        selectedComponentUUIDs: [],
        selectedComponentRects: [],
      });
      const expectedUUIDSelection = [
        "resultschild-uuid",
        "results-uuid",
        "button-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
      ];
      shiftSelect("child1-uuid", resultsChildComponent, expectedUUIDSelection);
    });
  });
});
