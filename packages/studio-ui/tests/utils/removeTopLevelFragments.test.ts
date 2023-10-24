import {
  ComponentState,
  ComponentStateKind,
  PageState,
  StandardComponentState,
} from "@yext/studio-plugin";
import removeTopLevelFragments from "../../src/utils/removeTopLevelFragments";

const childComponent: StandardComponentState = {
  kind: ComponentStateKind.Standard,
  uuid: "child-of-fragment",
  componentName: "Banner",
  props: {},
  metadataUUID: "banner-metadata-uuid",
  parentUUID: "fragment-uuid",
};

it("removes top level fragments from a PageState record", () => {
  const childFragment: ComponentState = {
    kind: ComponentStateKind.Fragment,
    uuid: "child-fragment-uuid",
    parentUUID: "fragment-uuid",
  };

  const page: PageState = {
    styleImports: [],
    filepath: "/unused",
    componentTree: [
      {
        kind: ComponentStateKind.Fragment,
        uuid: "fragment-uuid",
      },
      childComponent,
      childFragment,
    ],
  };

  const updatedPageRecord = removeTopLevelFragments({ MyPage: page });

  expect(updatedPageRecord.MyPage.componentTree).toEqual([
    {
      ...childComponent,
      parentUUID: undefined,
    },
    {
      ...childFragment,
      parentUUID: undefined,
    },
  ]);
});
