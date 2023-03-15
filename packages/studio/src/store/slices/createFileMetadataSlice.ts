import {
  ComponentMetadata,
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  PropValues,
} from "@yext/studio-plugin";
import initialStudioData from "virtual:yext-studio";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import { SliceCreator } from "../models/utils";
import { ImportType } from "../models/ImportType";

const createFileMetadataSlice: SliceCreator<FileMetadataSlice> = (
  set,
  get
) => ({
  UUIDToFileMetadata: initialStudioData.UUIDToFileMetadata,
  UUIDToImportedComponent: {},
  setFileMetadata: (metadataUUID: string, metadata: FileMetadata) =>
    set((store) => {
      store.UUIDToFileMetadata[metadataUUID] = metadata;
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
      if (componentState.kind === ComponentStateKind.Repeater) {
        componentState.repeatedComponent.props = props;
        return;
      }
      componentState.props = props;
    });
  },
  setRepeaterListInModule: (
    metadataUUID: string,
    componentUUID: string,
    listField: string
  ) => {
    set((store) => {
      const fileMetadata = store.UUIDToFileMetadata[metadataUUID];
      assertIsModuleMetadata(fileMetadata);
      const componentState = fileMetadata.componentTree.find(
        (c) => c.uuid === componentUUID
      );
      if (!componentState) {
        throw new Error(`Could not find componentState ${componentUUID}.`);
      } else if (componentState.kind !== ComponentStateKind.Repeater) {
        console.error(
          "Error in setComponentProps: The active component is not a Repeater."
        );
        return;
      }
      componentState.listField = listField;
    });
  },
  getComponentStateInsideModule(metadataUUID: string, componentUUID: string) {
    const fileMetadata = get().UUIDToFileMetadata[metadataUUID];
    assertIsModuleMetadata(fileMetadata);
    return fileMetadata.componentTree[componentUUID];
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
