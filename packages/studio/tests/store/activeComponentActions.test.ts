import { PropValues, PropValueKind, PropValueType, ComponentStateKind } from '@yext/studio-plugin';
import useStudioStore from '../../src/store/useStudioStore';
import { searchBarComponent } from '../__fixtures__/componentStates';
import { mockPageSliceStates } from '../__utils__/mockPageSliceState';

it("updateActiveComponentProps", () => {
  const consoleErrorSpy = jest
    .spyOn(global.console, "error")
    .mockImplementation();

  useStudioStore.getState().updateActiveComponentProps({});
  expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Error in updateActiveComponentProps: No active component in store."
  );
});

it("updates active component's prop values using updateActiveComponentProps", () => {
  const newPropValues: PropValues = {
    clicked: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: true,
    },
  };
  useStudioStore.getState().updateActiveComponentProps(newPropValues);
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
  useStudioStore.getState().updateActiveComponentProps(newPropValues);
  const pagesToUpdate =
    useStudioStore.getState().pages.pendingChanges.pagesToUpdate;
  expect(pagesToUpdate).toEqual(new Set<string>(["universal"]));
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
  useStudioStore.getState().updateActiveComponentProps(newPropValues);
  const actualPages = useStudioStore.getState().pages.pages;
  expect(actualPages).toEqual(initialPages);
  expect(consoleErrorSpy).toBeCalledWith(
    "Error in updateActiveComponentProps: No active component in store."
  );
});