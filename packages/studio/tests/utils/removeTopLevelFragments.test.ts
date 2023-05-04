import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
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
    cssImports: [],
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

it("removes top level fragments from a FileMetadata record", () => {
  const componentTree: ComponentState[] = [
    {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
    childComponent,
  ];
  const fileMetadataRecord: Record<string, FileMetadata> = {
    "module-metadata-uuid": {
      kind: FileMetadataKind.Module,
      componentTree,
      metadataUUID: "module-metadata-uuid",
      filepath: "/unused",
    },
    "component-metadata-uuid": {
      kind: FileMetadataKind.Component,
      filepath: "/unused",
      metadataUUID: "component-metadata-uuid",
    },
  };

  const updatedRecord = removeTopLevelFragments(fileMetadataRecord);

  expect(updatedRecord["component-metadata-uuid"]).toEqual(
    fileMetadataRecord["component-metadata-uuid"]
  );
  expect(updatedRecord["module-metadata-uuid"]).toEqual({
    ...fileMetadataRecord["module-metadata-uuid"],
    componentTree: [
      {
        ...childComponent,
        parentUUID: undefined,
      },
    ],
  });
});
