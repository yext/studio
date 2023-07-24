import ParsingOrchestrator from "../ParsingOrchestrator";
import {
  FileMetadata,
  FileMetadataKind,
  ModuleMetadata,
  PageState,
  SiteSettingsValues,
} from "../types";
import fs from "fs";
import { Project } from "ts-morph";
import upath from "upath";
import { TypeGuards } from "../utils";
import areEqualFileMetadata from "../utils/areEqualFileMetadata";

/**
 * FileSystemWriter is a class for housing content modification logic
 * for Studio editable source files (e.g. SiteSettingsFile, ModuleFile and PageFile).
 */
export class FileSystemWriter {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private project: Project
  ) {}

  /**
   * Update the page file's content based on provided page state.
   *
   * @param pageName - Name of the page file to update
   * @param pageState - the updated state for the page file
   */
  writeToPageFile(pageName: string, pageState: PageState): void {
    const pageFile = this.orchestrator.getPageFile(pageName);
    pageFile.updatePageFile(pageState);
  }

  /**
   * Update the module file's content based on provided module metadata.
   *
   * @param moduleMetadata - the updated metadata for the module file
   * @param moduleDependencies - the filepaths of any depended upon modules
   */
  writeToModuleFile(
    moduleMetadata: ModuleMetadata,
    moduleDependencies?: string[]
  ): void {
    FileSystemWriter.openFile(moduleMetadata.filepath);
    const moduleFile = this.orchestrator.getModuleFile(moduleMetadata.filepath);
    moduleFile.updateModuleFile(moduleMetadata, moduleDependencies);
    this.orchestrator.reloadFile(moduleMetadata.filepath);
  }

  writeToSiteSettings(siteSettingsValues: SiteSettingsValues): void {
    this.orchestrator.updateSiteSettings(siteSettingsValues);
  }

  /**
   * Deletes all files corresponding to FileMetadata that exist in the previous UUIDToFileMetadata
   * but not the updated UUIDToFileMetadata (i.e. FileMetadata that have been removed).
   */
  syncFileMetadata(updatedUUIDToFileMetadata: Record<string, FileMetadata>) {
    const UUIDToFileMetadata = this.orchestrator.getUUIDToFileMetadata();
    Object.keys(UUIDToFileMetadata).forEach((moduleUUID) => {
      if (!updatedUUIDToFileMetadata.hasOwnProperty(moduleUUID)) {
        this.removeFile(UUIDToFileMetadata[moduleUUID].filepath);
        this.orchestrator.reloadFile(UUIDToFileMetadata[moduleUUID].filepath);
      }
    });

    const modulesToUpdate = new Set(
      Object.keys(updatedUUIDToFileMetadata).filter((metadataUUID) => {
        const updatedMetadata = updatedUUIDToFileMetadata[metadataUUID];
        const isModule = updatedMetadata.kind === FileMetadataKind.Module;
        return (
          isModule &&
          !areEqualFileMetadata(
            updatedMetadata,
            UUIDToFileMetadata[metadataUUID]
          )
        );
      })
    );

    for (const moduleMetadataUUID of modulesToUpdate) {
      const getModuleMetadata = (metadataUUID: string): ModuleMetadata => {
        const metadata = updatedUUIDToFileMetadata[metadataUUID];
        if (metadata?.kind !== FileMetadataKind.Module) {
          throw new Error("Expected ModuleMetadata");
        }
        return metadata;
      };
      const moduleMetadata = getModuleMetadata(moduleMetadataUUID);
      const moduleDependencies = moduleMetadata.componentTree
        .filter(TypeGuards.isModuleState)
        .map((m) => getModuleMetadata(m.metadataUUID).filepath);
      this.writeToModuleFile(moduleMetadata, moduleDependencies);
    }
  }

  static openFile(filepath: string) {
    if (!fs.existsSync(filepath)) {
      const dirname = upath.dirname(filepath);
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      fs.openSync(filepath, "w");
    }
  }

  removeFile(filepath: string) {
    if (fs.existsSync(filepath)) {
      const sourceFile = this.project.getSourceFile(filepath);
      if (sourceFile) {
        this.project.removeSourceFile(sourceFile);
      }
      fs.rmSync(filepath);
    }
  }
}
