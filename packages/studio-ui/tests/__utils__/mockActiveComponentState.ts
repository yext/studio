import { ComponentState, FileMetadata } from "@yext/studio-plugin";
import mockStore from "./mockStore";

export default function mockStoreActiveComponent({
  activeComponent,
  activeComponentMetadata,
}: {
  activeComponent?: ComponentState;
  activeComponentMetadata?: FileMetadata;
}): void {
  mockStore({
    pages: {
      pages: {
        index: {
          componentTree: activeComponent ? [activeComponent] : [],
          styleImports: [],
          filepath: "mock-filepath",
        },
      },
      ...(activeComponent && { activeComponentUUID: activeComponent.uuid }),
      activePageName: "index",
    },
    fileMetadatas: {
      UUIDToFileMetadata: activeComponentMetadata && {
        [activeComponentMetadata.metadataUUID]: activeComponentMetadata,
      },
    },
  });
}
