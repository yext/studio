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
import { ImportType } from "../models/ImportType";
import { FunctionComponent } from "react";

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

    const importedValue = await import(/* @vite-ignore */ metadata.filepath);
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

function getFunctionComponent(
  importedValue: Record<string, unknown>,
  name: string
): ImportType | undefined {
  if (typeof importedValue[name] === "function") {
    return importedValue[name] as FunctionComponent;
  } else if (typeof importedValue["default"] === "function") {
    return importedValue["default"] as FunctionComponent;
  } else {
    console.error(`${name} is not a valid functional component.`);
  }
}
