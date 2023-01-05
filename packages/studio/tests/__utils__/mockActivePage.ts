import { PageState } from "@yext/studio-plugin";
import mockStore from "./mockStore";

export default function mockActivePage(page: PageState) {
  mockStore({
    pages: {
      activePageName: "testpage",
      pages: {
        testpage: page,
      },
    },
  });
}
