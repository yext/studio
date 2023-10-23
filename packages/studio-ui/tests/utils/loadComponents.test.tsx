import { FileMetadataKind } from "@yext/studio-plugin";
import { loadComponents } from "../../src/utils/loadUserAssets";
import mockStore, { MockStudioStore } from "../__utils__/mockStore";
import path from "path";
import { waitFor } from "@testing-library/react";
import useStudioStore from "../../src/store/useStudioStore";

const mockStoreState: MockStudioStore = {
  fileMetadatas: {
    UUIDToFileMetadata: {
      "banner-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "banner-metadata-uuid",
        filepath: path.resolve(__dirname, "../__mocks__/Banner.tsx"),
        cssImports: [],
      },
      "container-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "container-metadata-uuid",
        filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
        cssImports: [],
      },
    },
    UUIDToImportedComponent: {},
  },
};

it("loads all components", async () => {
  mockStore(mockStoreState);
  await Promise.all(loadComponents());
  await waitFor(() => {
    expect(
      useStudioStore.getState().fileMetadatas.UUIDToImportedComponent
    ).toEqual({
      "banner-metadata-uuid": expect.any(Function),
      "container-metadata-uuid": expect.any(Function),
    });
  });
});
