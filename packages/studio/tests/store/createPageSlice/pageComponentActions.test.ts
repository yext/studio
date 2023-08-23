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

    it("updates activeComponentUUID and resets selectedComponentUUIDs using updateActiveComponent", () => {
      useStudioStore.getState().pages.updateActiveComponent("searchbar-uuid");
      const activeComponentUUID =
        useStudioStore.getState().pages.activeComponentUUID;
      expect(activeComponentUUID).toEqual("searchbar-uuid");
    });

    it("resets selectedComponentUUIDs when updateActiveComponent is called", () => {
      useStudioStore.getState().pages.addSelectedComponentUUID("results-uuid");
      useStudioStore.getState().pages.addSelectedComponentUUID("child1-uuid");
      useStudioStore.getState().pages.addSelectedComponentUUID("child2-uuid");
      useStudioStore.getState().pages.updateActiveComponent("searchbar-uuid");
      const selectedComponentUUIDs =
        useStudioStore.getState().pages.selectedComponentUUIDs;
      expect(selectedComponentUUIDs).toEqual(new Set(["searchbar-uuid"]));
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
      expectedUUIDSelection: Set<string>
    ) {
      store().pages.updateActiveComponent(activeUUID);
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
        selectedComponentUUIDs: new Set(["results-uuid"]),
        selectedComponentRectsMap: {
          "results-uuid": domRect(1, 2, 3, 4),
        },
      });
    });

    it("returns the UUID of the first selected component, a top-level component, in the tree", () => {
      store().pages.addSelectedComponentUUID("container-uuid");
      const firstSelectedComponentUUID =
        store().pages.getFirstSelectedComponentUUID();
      expect(firstSelectedComponentUUID).toEqual("results-uuid");
    });

    it("returns the UUID of the first selected component, a child component, in the tree", () => {
      store().pages.clearSelectedComponents();
      store().pages.addSelectedComponentUUID("child1-uuid");
      store().pages.addSelectedComponentUUID("child2-uuid");
      const firstSelectedComponentUUID =
        store().pages.getFirstSelectedComponentUUID();
      expect(firstSelectedComponentUUID).toEqual("child1-uuid");
    });

    it("adds a selected component UUID using addSelectedComponentUUID", () => {
      store().pages.addSelectedComponentUUID("searchbar-uuid");
      const selectedComponentUUIDs = store().pages.selectedComponentUUIDs;
      expect(selectedComponentUUIDs).toEqual(
        new Set(["results-uuid", "searchbar-uuid"])
      );
    });

    it("adds a selected component Rect using addSelectedComponentRect", () => {
      store().pages.addSelectedComponentRect(
        "searchbar-uuid",
        domRect(5, 6, 7, 8)
      );
      const selectedComponentRectsMap = store().pages.selectedComponentRectsMap;
      expect(selectedComponentRectsMap).toEqual({
        "results-uuid": domRect(1, 2, 3, 4),
        "searchbar-uuid": domRect(5, 6, 7, 8),
      });
    });

    it("clears all selected component UUIDs and Rects using clearSelectedComponents", () => {
      store().pages.clearSelectedComponents();
      const [selectedComponentUUIDs, selectedComponentRectsMap] = [
        store().pages.selectedComponentUUIDs,
        store().pages.selectedComponentRectsMap,
      ];
      expect(selectedComponentUUIDs).toEqual(new Set());
      expect(selectedComponentRectsMap).toEqual({});
    });

    it("shift selects components after the active component", () => {
      const expectedUUIDSelection = new Set([
        "results-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
        "button-uuid",
      ]);
      shiftSelect("results-uuid", buttonComponent, expectedUUIDSelection);
    });

    it("shift selects components before the active component", () => {
      const expectedUUIDSelection = new Set([
        "results-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
        "button-uuid",
      ]);
      shiftSelect("button-uuid", resultsComponent, expectedUUIDSelection);
    });

    it("shift selects between levels", () => {
      const expectedUUIDSelection = new Set([
        "searchbar-uuid",
        "results-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
      ]);
      shiftSelect("searchbar-uuid", child1Component, expectedUUIDSelection);
    });

    it("shift selects all the children within a container", () => {
      const expectedUUIDSelection = new Set(["child1-uuid", "child2-uuid"]);
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
        selectedComponentUUIDs: new Set(),
        selectedComponentRectsMap: {},
      });
      const expectedUUIDSelection = new Set([
        "resultschild-uuid",
        "results-uuid",
        "button-uuid",
        "child1-uuid",
        "child2-uuid",
        "container-uuid",
      ]);
      shiftSelect("child1-uuid", resultsChildComponent, expectedUUIDSelection);
    });
  });
});
