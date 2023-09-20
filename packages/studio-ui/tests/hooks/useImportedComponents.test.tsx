import {
  ComponentStateKind,
  FileMetadataKind,
  PageState,
} from "@yext/studio-plugin";
import useImportedComponents from "../../src/hooks/useImportedComponents";
import mockStore, { MockStudioStore } from "../__utils__/mockStore";
import path from "path";
import { waitFor, renderHook } from "@testing-library/react";
import useStudioStore from "../../src/store/useStudioStore";

const mockStoreState: MockStudioStore = {
  fileMetadatas: {
    UUIDToFileMetadata: {
      "banner-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "banner-metadata-uuid",
        filepath: path.resolve(__dirname, "../__mocks__/Banner.tsx"),
      },
      "container-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "container-metadata-uuid",
        filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
      },
    },
    UUIDToImportedComponent: {},
  },
};

const pageState: PageState = {
  componentTree: [
    {
      kind: ComponentStateKind.Standard,
      componentName: "Banner",
      props: {},
      uuid: "banner-uuid",
      metadataUUID: "banner-metadata-uuid",
    },
    {
      kind: ComponentStateKind.Standard,
      componentName: "Container",
      props: {},
      uuid: "container-uuid",
      metadataUUID: "container-metadata-uuid",
    },
  ],
  cssImports: [],
  filepath: "some/file/path",
};

it("loads functional components based on provided page state", async () => {
  mockStore(mockStoreState);
  renderHook(() => useImportedComponents(pageState.componentTree));
  await waitFor(() => {
    expect(
      useStudioStore.getState().fileMetadatas.UUIDToImportedComponent
    ).toEqual({
      "banner-metadata-uuid": expect.any(Function),
      "container-metadata-uuid": expect.any(Function),
    });
  });
});
