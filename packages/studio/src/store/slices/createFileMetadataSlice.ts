import {
  ComponentMetadata,
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  PropValues,
} from "@yext/studio-plugin";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import { SliceCreator } from "../models/utils";
import { ImportType } from "../models/ImportType";

const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: {},
  UUIDToImportedComponent: {},
  pendingChanges: {
    modulesToUpdate: new Set<string>(),
    modulesToRemove: new Set<string>(),
  },
  setFileMetadata: (metadataUUID: string, metadata: FileMetadata) =>
    set((store) => {
      store.UUIDToFileMetadata[metadataUUID] = metadata;
      if (metadata.kind === FileMetadataKind.Module) {
        store.pendingChanges.modulesToUpdate.add(metadataUUID);
      }
    }),
  getFileMetadata: (metadataUUID: string) =>
    get().UUIDToFileMetadata[metadataUUID],
  removeFileMetadata: (metadataUUID: string) =>
    set((store) => {
      const metadata = store.UUIDToFileMetadata[metadataUUID];
      if (metadata.kind === FileMetadataKind.Module) {
        delete store.UUIDToFileMetadata[metadataUUID];
      } else {
        console.error(
          "removeFileMetadata is only allowed for modules, not:",
          metadata.kind
        );
      }
    }),
  getComponentMetadata: (metadataUUID) => {
    const fileMetadata = get().getFileMetadata(metadataUUID);
    assertIsComponentMetadata(fileMetadata);
    return fileMetadata;
  },
  getModuleMetadata: (metadataUUID) => {
    const fileMetadata = get().getFileMetadata(metadataUUID);
    assertIsModuleMetadata(fileMetadata);
    return fileMetadata;
  },
  setUUIDToImportedComponent: (
    importedComponents: Record<string, ImportType>
  ) => set({ UUIDToImportedComponent: importedComponents }),
  setComponentTreeInModule(
    metadataUUID: string,
    componentTree: ComponentState[]
  ) {
    set((store) => {
      const fileMetadata = store.UUIDToFileMetadata[metadataUUID];
      assertIsModuleMetadata(fileMetadata);
      fileMetadata.componentTree = componentTree;
    });
  },
  updateComponentPropsInsideModule(
    metadataUUID: string,
    componentUUID: string,
    props: PropValues
  ) {
    set((store) => {
      const fileMetadata = store.UUIDToFileMetadata[metadataUUID];
      assertIsModuleMetadata(fileMetadata);
      const componentState = fileMetadata.componentTree.find(
        (c) => c.uuid === componentUUID
      );
      if (!componentState) {
        throw new Error(`Could not find componentState ${componentUUID}.`);
      } else if (
        componentState.kind === ComponentStateKind.BuiltIn ||
        componentState.kind === ComponentStateKind.Fragment
      ) {
        throw new Error(
          "Cannot update props for BuiltIn or Fragment components."
        );
      }
      componentState.props = props;
    });
  },
  getComponentStateInsideModule(metadataUUID: string, componentUUID: string) {
    const fileMetadata = get().UUIDToFileMetadata[metadataUUID];
    assertIsModuleMetadata(fileMetadata);
    return fileMetadata.componentTree[componentUUID];
  },
  addComponentToModule(metadataUUID: string, componentState: ComponentState) {
    const metadata = get().UUIDToFileMetadata[metadataUUID];
    assertIsModuleMetadata(metadata);
    get().setComponentTreeInModule(metadataUUID, [
      ...metadata.componentTree,
      componentState,
    ]);
  },
  removeComponentFromModule(metadataUUID, componentUUID) {
    const metadata = get().UUIDToFileMetadata[metadataUUID];
    assertIsModuleMetadata(metadata);
    get().setComponentTreeInModule(
      metadataUUID,
      metadata.componentTree.filter((c) => c.uuid !== componentUUID)
    );
  },
});

function assertIsModuleMetadata(
  fileMetadata: FileMetadata
): asserts fileMetadata is ModuleMetadata {
  if (fileMetadata.kind !== FileMetadataKind.Module) {
    throw new Error(
      `Expected a ModuleMetadata, instead received ${JSON.stringify(
        fileMetadata,
        null,
        2
      )}.`
    );
  }
}

function assertIsComponentMetadata(
  fileMetadata: FileMetadata
): asserts fileMetadata is ComponentMetadata {
  if (fileMetadata.kind !== FileMetadataKind.Component) {
    throw new Error(
      `Expected a ComponentMetadata, instead received ${JSON.stringify(
        fileMetadata,
        null,
        2
      )}.`
    );
  }
}

export default createFileMetadataSlice;
