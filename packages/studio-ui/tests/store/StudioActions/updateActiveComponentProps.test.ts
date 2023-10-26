import { PropValues, PropValueKind, PropValueType } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import {
  fragmentComponent,
  searchBarComponent,
} from "../../__fixtures__/componentStates";
import { mockPageSliceStates } from "../../__utils__/mockPageSliceState";

it("logs an error when using setComponentProps if the component is a fragment", () => {
  const initialPages = {
    universal: {
      pageName: "universal",
      componentTree: [fragmentComponent, searchBarComponent],
      styleImports: [],
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
  const action = () =>
    useStudioStore.getState().actions.updateActiveComponentProps(newPropValues);
  expect(action).toThrow(
    "Error in updateActiveComponentProps: Cannot update props for BuiltIn or Fragment components."
  );
  const actualPages = useStudioStore.getState().pages.pages;
  expect(actualPages).toEqual(initialPages);
});
