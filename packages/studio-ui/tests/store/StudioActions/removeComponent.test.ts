import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import { searchBarComponent } from "../../__fixtures__/componentStates";
import mockStore from "../../__utils__/mockStore";

const initialTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Fragment,
    uuid: "mock-uuid-0",
  },
  {
    ...searchBarComponent,
    uuid: "mock-uuid-1",
    parentUUID: "mock-uuid-0",
  },
  {
    ...searchBarComponent,
    uuid: "mock-uuid-2",
    parentUUID: "mock-uuid-1",
  },
  {
    ...searchBarComponent,
    uuid: "mock-uuid-3",
    parentUUID: "mock-uuid-0",
  },
];

it("removes component and its children from the active PageState", () => {
  mockStore({
    pages: {
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree: initialTree,
          styleImports: [],
          filepath: "unused",
        },
      },
    },
  });

  useStudioStore.getState().actions.removeComponent("mock-uuid-1");
  const updatedTree =
    useStudioStore.getState().pages.pages["pagename"].componentTree;
  expect(updatedTree).toEqual([initialTree[0], initialTree[3]]);
});
