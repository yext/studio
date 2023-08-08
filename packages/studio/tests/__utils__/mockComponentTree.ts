import { ComponentState, FileMetadata } from "@yext/studio-plugin";
import mockStore from "./mockStore";
import DOMRectProperties from "../../src/store/models/DOMRectProperties";

export default function mockComponentTree({
  componentTree,
  UUIDToFileMetadata,
  moduleUUIDBeingEdited,
  activeComponentUUID,
  selectedComponentUUIDs,
  selectedComponentRects,
}: {
  componentTree: ComponentState[];
  UUIDToFileMetadata?: Record<string, FileMetadata>;
  moduleUUIDBeingEdited?: string;
  activeComponentUUID?: string;
  selectedComponentUUIDs?: string[];
  selectedComponentRects?: DOMRectProperties[];
}): void {
  mockStore({
    pages: {
      pages: {
        pagename: {
          componentTree,
          cssImports: [],
          filepath: "mock-filepath",
        },
      },
      activePageName: "pagename",
      moduleUUIDBeingEdited,
      ...(activeComponentUUID && { activeComponentUUID: activeComponentUUID }),
      ...(selectedComponentUUIDs && {
        selectedComponentUUIDs: selectedComponentUUIDs,
      }),
      ...(selectedComponentRects && {
        selectedComponentRects: selectedComponentRects,
      }),
    },
    ...(UUIDToFileMetadata && {
      fileMetadatas: {
        UUIDToFileMetadata: UUIDToFileMetadata,
      },
    }),
  });
}
