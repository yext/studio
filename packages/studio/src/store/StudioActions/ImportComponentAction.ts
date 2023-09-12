import {
  ComponentState,
  ComponentStateKind,
  ErrorComponentState,
  FileMetadata,
  StandardComponentState
} from "@yext/studio-plugin";
import FileMetadataSlice from "../models/slices/FileMetadataSlice";
import dynamicImportFromBrowser from "../../utils/dynamicImportFromBrowser";
import getFunctionComponent from "../../utils/getFunctionComponent";

/**
 * Imports a component into the global store.
 */
export default class ImportComponentAction {
  constructor(private getFileMetadataSlice: () => FileMetadataSlice) {}

  importComponent = async (c: ComponentState): Promise<void> => {
    if (
      c.kind !== ComponentStateKind.Standard &&
      c.kind !== ComponentStateKind.Error
    ) {
      return;
    }

    await this.importStandardComponentState(c);
  };

  private importStandardComponentState = async (
    componentState: StandardComponentState | ErrorComponentState
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
}
