import { ComponentState, FileMetadata } from "@yext/studio-plugin";
import mockStore from "./mockStore";

export default function mockComponentTree({
  componentTree,
  UUIDToFileMetadata,
  activeComponentUUID,
}: {
  componentTree: ComponentState[];
  UUIDToFileMetadata: Record<string, FileMetadata>;
  activeComponentUUID?: string;
}): void {
  mockStore({
    pages: {
      pages: {
        index: {
          componentTree: componentTree,
          cssImports: [],
          filepath: "mock-filepath",
        },
      },
      ...(activeComponentUUID && { activeComponentUUID: activeComponentUUID }),
      activePageName: "index",
    },
    fileMetadatas: {
      UUIDToFileMetadata: UUIDToFileMetadata,
    },
  });
}
