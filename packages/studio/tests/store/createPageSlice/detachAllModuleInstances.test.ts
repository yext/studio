import {
  ComponentStateKind,
  FileMetadataKind,
  PageState,
} from "@yext/studio-plugin";
import useStudioStore from "../../../src/store/useStudioStore";
import mockStore from "../../__utils__/mockStore";

it("can delete a module and detach all of its instances across multiple pages", () => {
  const basicPageState: PageState = {
    componentTree: [
      {
        kind: ComponentStateKind.Module,
        componentName: "Star",
        props: {},
        uuid: "first-comp-state",
        metadataUUID: "star-metadata-uuid",
      },
    ],
    cssImports: [],
    filepath: "unused",
  };
  mockStore({
    pages: {
      pages: {
        firstPage: basicPageState,
        secondPage: basicPageState,
      },
    },
  });

  useStudioStore.getState().pages.detachAllModuleInstances({
    kind: FileMetadataKind.Module,
    metadataUUID: "star-metadata-uuid",
    componentTree: [
      {
        kind: ComponentStateKind.Standard,
        componentName: "Banner",
        props: {},
        uuid: "will-be-replaced",
        metadataUUID: "banner-metadata-uuid",
      },
    ],
    filepath: "unused/Star.tsx",
  });

  const expectedUpdatedTree = [
    {
      kind: ComponentStateKind.Standard,
      componentName: "Banner",
      props: {},
      uuid: expect.any(String),
      metadataUUID: "banner-metadata-uuid",
    },
  ];

  expect(useStudioStore.getState().pages.pages).toEqual({
    firstPage: {
      ...basicPageState,
      componentTree: expectedUpdatedTree,
    },
    secondPage: {
      ...basicPageState,
      componentTree: expectedUpdatedTree,
    },
  });
});
