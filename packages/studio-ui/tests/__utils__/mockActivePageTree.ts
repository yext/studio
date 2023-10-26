import { ComponentState } from "@yext/studio-plugin";
import mockStore from "./mockStore";

export function mockActivePageTree(componentTree: ComponentState[]) {
  mockStore({
    pages: {
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree,
          styleImports: [],
          filepath: "unused",
        },
      },
    },
  });
}
