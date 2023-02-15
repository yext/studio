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
import lodash from "lodash";
import path from "path";
import { TypeGuards } from "../utils";

/**
 * FileSystemWriter is a class for housing content modification logic
 * for Studio editable source files (e.g. SiteSettingsFile, ModuleFile and PageFile).
 */
export class FileSystemWriter {
  constructor(
    private orchestrator: ParsingOrchestrator,
    private project: Project,
    private isPagesJSRepo = false
  ) {}

  /**
   * Update the page file's content based on provided page state.
   *
   * @param pageName - Name of the page file to update
   * @param pageState - the updated state for the page file
   */
  writeToPageFile(pageName: string, pageState: PageState): void {
    const pageFile = this.orchestrator.getPageFile(pageName);
    pageFile.updatePageFile(pageState, {
      updateStreamConfig: this.isPagesJSRepo,
    });
  }

  /**
   * Update the module file's content based on provided module metadata.
   *
   * @param filepath - path of the module file to update
   * @param moduleMetadata - the updated metadata for the module file
   * @param moduleDependencies - the filepaths of any depended upon modules
   */
  writeToModuleFile(
    filepath: string,
    moduleMetadata: ModuleMetadata,
    moduleDependencies?: string[]
  ): void {
    FileSystemWriter.openFile(moduleMetadata.filepath);
    const moduleFile = this.orchestrator.getModuleFile(filepath);
    moduleFile.updateModuleFile(moduleMetadata, moduleDependencies);
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

    const getModuleMetadata = (metadataUUID: string): ModuleMetadata => {
      const metadata = updatedUUIDToFileMetadata[metadataUUID];
      if (metadata?.kind !== FileMetadataKind.Module) {
        throw new Error("Expected ModuleMetadata");
      }
      return metadata;
    };

    const modulesToUpdate = new Set(
      Object.keys(updatedUUIDToFileMetadata).filter((metadataUUID) => {
        const updatedMetadata = updatedUUIDToFileMetadata[metadataUUID];
        if (updatedMetadata.kind !== FileMetadataKind.Module) {
          return false;
        }
        const originalMetadata = UUIDToFileMetadata[metadataUUID];
        if (lodash.isEqual(originalMetadata, updatedMetadata)) {
          return false;
        }
        return true;
      })
    );
    let maxLoopsRemaining = modulesToUpdate.size;
    while (modulesToUpdate.size > 0 && maxLoopsRemaining-- > 0) {
      for (const metadataUUID of modulesToUpdate.values()) {
        const moduleMetadata = getModuleMetadata(metadataUUID);
        const moduleDependencies = moduleMetadata.componentTree.filter(
          TypeGuards.isModuleState
        );
        const numUnresolvedModuleDeps = moduleDependencies.filter((m) => {
          return modulesToUpdate.has(m.metadataUUID);
        }).length;

        if (numUnresolvedModuleDeps > 0) {
          continue;
        }

        const moduleDependencyPaths = moduleDependencies.map((c) => {
          return getModuleMetadata(c.metadataUUID).filepath;
        });
        this.writeToModuleFile(
          moduleMetadata.filepath,
          moduleMetadata,
          moduleDependencyPaths
        );
        this.orchestrator.reloadFile(moduleMetadata.filepath);
        modulesToUpdate.delete(metadataUUID);
      }
    }
  }

  static openFile(filepath: string) {
    if (!fs.existsSync(filepath)) {
      const dirname = path.dirname(filepath);
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
