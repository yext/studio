import {
  ComponentState,
  ComponentStateHelpers,
  ComponentStateKind,
  ErrorComponentState,
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  StandardOrModuleComponentState,
  TypeGuards,
} from "@yext/studio-plugin";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import dynamicImportFromBrowser from "../../utils/dynamicImportFromBrowser";
import getFunctionComponent from "../../utils/getFunctionComponent";

/**
 * Imports a component into the global store.
 *
 * Modules are not directly imported, but instead have all their constituents
 * imported instead, similar to a Page.
 */
export default class ImportComponentAction {
  constructor(private getFileMetadataSlice: () => FileMetadataSlice) {}

  importComponent = async (c: ComponentState): Promise<void> => {
    if (
      !TypeGuards.isEditableComponentState(c) &&
      c.kind !== ComponentStateKind.Error
    ) {
      return;
    }

    const componentState = ComponentStateHelpers.extractRepeatedState(c);
    await this.importStandardOrModuleComponentState(componentState);
  };

  private importStandardOrModuleComponentState = async (
    componentState: StandardOrModuleComponentState | ErrorComponentState
  ) => {
    const { metadataUUID, componentName } = componentState;
    const { getFileMetadata, UUIDToImportedComponent } =
      this.getFileMetadataSlice();
    if (UUIDToImportedComponent.hasOwnProperty(metadataUUID)) {
      return;
    }

    const metadata: FileMetadata | undefined = getFileMetadata(metadataUUID);
    if (!metadata) {
      return;
    }

    if (metadata.kind === FileMetadataKind.Module) {
      return this.importModule(metadata);
    }

    const importedValue = await dynamicImportFromBrowser(metadata.filepath);
    const functionComponent = getFunctionComponent(
      importedValue,
      componentName
    );

    if (functionComponent) {
      this.getFileMetadataSlice().setImportedComponent(
        metadataUUID,
        functionComponent
      );
    }
  };

  importModule = async (metadata: ModuleMetadata) => {
    return Promise.all(
      metadata.componentTree.map((c) => this.importComponent(c))
    );
  };
}
