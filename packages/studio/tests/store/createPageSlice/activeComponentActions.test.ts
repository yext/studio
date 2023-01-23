import useStudioStore from "../../../src/store/useStudioStore";
import {
  ComponentStateKind,
  PropValueKind,
  PropValues,
  PropValueType,
} from "@yext/studio-plugin";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";
import {
  searchBarComponent,
  resultsComponent,
  fragmentComponent,
} from "../../__fixtures__/componentStates";

describe("PageSlice", () => {
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

    it("updates active component's prop values using setActiveComponentProps", () => {
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const componentState =
        useStudioStore.getState().pages.pages["universal"].componentTree[1];
      const actualPropValues =
        componentState.kind === ComponentStateKind.Fragment
          ? undefined
          : componentState.props;
      expect(actualPropValues).toEqual(newPropValues);
    });

    it("updates pagesToUpdate when setActiveComponentProps is used", () => {
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const pagesToUpdate =
        useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
      expect(pagesToUpdate).toEqual(new Set<string>(["universal"]));
    });

    it("logs an error when using setActiveComponentProps if the active component is a fragment", () => {
      const initialPages = {
        universal: {
          pageName: "universal",
          componentTree: [fragmentComponent, searchBarComponent],
          cssImports: [],
          filepath: "mock-filepath",
        },
      };
      mockPageSliceStates({
        pages: initialPages,
        activePageName: "universal",
        activeComponentUUID: fragmentComponent.uuid,
      });
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual(initialPages);
      expect(consoleErrorSpy).toBeCalledWith(
        "Error in setActiveComponentProps: The active component is a fragment and does not accept props."
      );
    });

    it("logs an error when using setActiveComponentProps before an active component is selected", () => {
      const initialPages = {
        universal: {
          pageName: "universal",
          componentTree: [searchBarComponent],
          cssImports: [],
          filepath: "mock-filepath",
        },
      };
      mockPageSliceStates({
        pages: initialPages,
        activePageName: "universal",
        activeComponentUUID: undefined,
      });
      const newPropValues: PropValues = {
        clicked: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      };
      const consoleErrorSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation();
      useStudioStore.getState().pages.setActiveComponentProps(newPropValues);
      const actualPages = useStudioStore.getState().pages.pages;
      expect(actualPages).toEqual(initialPages);
      expect(consoleErrorSpy).toBeCalledWith(
        "Error in setActiveComponentProps: No active component selected in store."
      );
    });

    it("returns active component using getActiveComponentState", () => {
      const activeComponent = useStudioStore
        .getState()
        .pages.getActiveComponentState();
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
        .pages.getActiveComponentState();
      expect(activeComponent).toEqual(undefined);
    });
  });
});
