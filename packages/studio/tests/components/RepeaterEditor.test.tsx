import { render, screen } from "@testing-library/react";
import {
  ComponentStateKind,
  ModuleState,
  RepeaterState,
  StandardComponentState,
} from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import RepeaterEditor from "../../src/components/RepeaterEditor";
import { mockActivePageTree } from "../__utils__/mockActivePageTree";

const commonComponentState: Omit<StandardComponentState, "uuid"> = {
  kind: ComponentStateKind.Standard,
  componentName: "Comp",
  props: {},
  metadataUUID: "mock-metadata-0",
};
const containerComponentState: StandardComponentState = {
  ...commonComponentState,
  uuid: "mock-uuid-0",
};
const standardComponentState: StandardComponentState = {
  ...commonComponentState,
  uuid: "mock-uuid-1",
  parentUUID: "mock-uuid-0",
};
const moduleState: ModuleState = {
  kind: ComponentStateKind.Module,
  componentName: "Mod",
  uuid: "mock-uuid-2",
  props: {},
  metadataUUID: "mock-metadata-2",
};
const repeaterState: RepeaterState = {
  kind: ComponentStateKind.Repeater,
  uuid: "mock-uuid-3",
  listExpression: "myList",
  repeatedComponent: commonComponentState,
};

beforeEach(() => {
  mockActivePageTree([
    containerComponentState,
    standardComponentState,
    moduleState,
    repeaterState,
  ]);
});

it("does not render a List toggle for container component", () => {
  render(<RepeaterEditor componentState={containerComponentState} />);
  screen.getByText("List");
  const toggle = screen.getByRole("checkbox");
  expect(toggle).toBeDisabled();
  expect(toggle).not.toBeChecked();
});

it("renders a List toggle for non-repeater component", () => {
  render(<RepeaterEditor componentState={standardComponentState} />);
  screen.getByText("List");
  const toggle = screen.getByRole("checkbox");
  expect(toggle).toBeEnabled();
  expect(toggle).not.toBeChecked();
});

it("renders a List toggle for non-repeater module", () => {
  render(<RepeaterEditor componentState={moduleState} />);
  screen.getByText("List");
  const toggle = screen.getByRole("checkbox");
  expect(toggle).toBeEnabled();
  expect(toggle).not.toBeChecked();
});

it("renders List toggle and expression for Repeater", () => {
  render(<RepeaterEditor componentState={repeaterState} />);
  screen.getByText("List");
  const toggle = screen.getByRole("checkbox");
  expect(toggle).toBeEnabled();
  expect(toggle).toBeChecked();

  screen.getByText("List Field");
  const input = screen.getByRole("textbox");
  expect(input).toHaveValue("myList");
});

it("calls addRepeater when enabling toggle", async () => {
  const addRepeaterSpy = jest
    .spyOn(useStudioStore.getState().actions, "addRepeater")
    .mockImplementation();
  render(<RepeaterEditor componentState={standardComponentState} />);
  await userEvent.click(screen.getByRole("checkbox"));
  expect(addRepeaterSpy).toBeCalledTimes(1);
  expect(addRepeaterSpy).toBeCalledWith(standardComponentState);
});

it("calls removeRepeater when disabling toggle", async () => {
  const removeRepeaterSpy = jest
    .spyOn(useStudioStore.getState().actions, "removeRepeater")
    .mockImplementation();
  render(<RepeaterEditor componentState={repeaterState} />);
  await userEvent.click(screen.getByRole("checkbox"));
  expect(removeRepeaterSpy).toBeCalledTimes(1);
  expect(removeRepeaterSpy).toBeCalledWith(repeaterState);
});

it("calls updateRepeaterListExpression when updating list field input", async () => {
  const updateListSpy = jest
    .spyOn(useStudioStore.getState().actions, "updateRepeaterListExpression")
    .mockImplementation();
  render(<RepeaterEditor componentState={repeaterState} />);
  const input = screen.getByRole("textbox");
  await userEvent.type(input, "s");
  expect(updateListSpy).toBeCalledTimes(1);
  expect(updateListSpy).toBeCalledWith("myLists", repeaterState);
});
