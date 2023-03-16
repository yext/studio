import { ComponentState } from "@yext/studio-plugin";
import mockStore from "./mockStore";

export function mockActivePageTree(
  componentTree: ComponentState[],
  moduleUUIDBeingEdited?: string
) {
  mockStore({
    pages: {
      moduleUUIDBeingEdited,
      activePageName: "pagename",
      pages: {
        pagename: {
          componentTree,
          cssImports: [],
          filepath: "unused",
        },
      },
    },
  });
}
