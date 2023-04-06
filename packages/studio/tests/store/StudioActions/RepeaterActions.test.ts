import {
  ComponentStateKind,
  ModuleState,
  RepeaterState,
  StandardComponentState,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import { mockActivePageTree } from "../../__utils__/mockActivePageTree";

const componentState: StandardComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Comp",
  uuid: "mock-uuid-0",
  props: {},
  metadataUUID: "mock-metadata-0",
};
const moduleState: ModuleState = {
  kind: ComponentStateKind.Module,
  componentName: "Mod",
  uuid: "mock-uuid-1",
  props: {},
  metadataUUID: "mock-metadata-1",
};

it("converts a component into a repeater using addRepeater", () => {
  mockActivePageTree([componentState, moduleState]);
  useStudioStore.getState().actions.addRepeater(componentState);
  const expectedRepeaterState: RepeaterState = {
    kind: ComponentStateKind.Repeater,
    uuid: "mock-uuid-0",
    listExpression: "",
    repeatedComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "Comp",
      props: {},
      metadataUUID: "mock-metadata-0",
    },
  };
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    expectedRepeaterState,
    moduleState,
  ]);
});

it("converts a repeater into a module using removeRepeater", () => {
  const repeaterState: RepeaterState = {
    kind: ComponentStateKind.Repeater,
    uuid: "mock-uuid-1",
    listExpression: "",
    repeatedComponent: {
      kind: ComponentStateKind.Module,
      componentName: "Mod",
      props: {},
      metadataUUID: "mock-metadata-1",
    },
  };
  mockActivePageTree([componentState, repeaterState]);
  useStudioStore.getState().actions.removeRepeater(repeaterState);
  expect(useStudioStore.getState().actions.getComponentTree()).toEqual([
    componentState,
    moduleState,
  ]);
});
