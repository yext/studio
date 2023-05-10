import {
  ComponentState,
  ComponentStateHelpers,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
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
    if (!TypeGuards.isEditableComponentState(c)) {
      return;
    }

    const componentState =
      ComponentStateHelpers.extractStandardOrModuleComponentState(c);
    if (componentState.kind === ComponentStateKind.Error) {
      return;
    }
    await this.importStandardOrModuleComponentState(componentState);
  };

  private importStandardOrModuleComponentState = async (
    componentState: StandardOrModuleComponentState
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

    if (
      componentState.kind === ComponentStateKind.Module &&
      metadata.kind === FileMetadataKind.Module
    ) {
      await Promise.all(
        metadata.componentTree.map((c) => this.importComponent(c))
      );
      return;
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
