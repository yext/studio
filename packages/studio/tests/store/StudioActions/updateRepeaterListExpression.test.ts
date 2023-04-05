import { RepeaterState, ComponentStateKind } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import { mockActivePageTree } from "../../__utils__/mockActivePageTree";

it("can update list expression of repeater component", () => {
  const repeaterState: RepeaterState = {
    kind: ComponentStateKind.Repeater,
    uuid: "banner-0",
    listExpression: "",
    repeatedComponent: {
      kind: ComponentStateKind.Standard,
      props: {},
      componentName: "Banner",
      metadataUUID: "bannerMeta",
    },
  };
  mockActivePageTree([repeaterState]);
  useStudioStore.getState().pages.setActiveComponentUUID("banner-0");
  useStudioStore
    .getState()
    .actions.updateRepeaterListExpression("someList", repeaterState);
  expect(
    useStudioStore.getState().actions.getActiveComponentState()?.[
      "listExpression"
    ]
  ).toEqual("someList");
});
