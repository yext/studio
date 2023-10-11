import upath from "upath";
import {
  FileMetadata,
  UserPaths,
  StudioData,
  SiteSettingsValues,
  SiteSettings,
  FileMetadataKind,
  ErrorFileMetadata,
  StudioConfigWithDefaulting,
} from "../types";
import fs from "fs";
import ComponentFile from "../sourcefiles/ComponentFile";
import PageFile from "../sourcefiles/PageFile";
import SiteSettingsFile from "../sourcefiles/SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";
import { v4 } from "uuid";
import { ParsingError } from "../errors/ParsingError";
import createFilenameMapping from "./createFilenameMapping";
import LayoutOrchestrator from "./LayoutOrchestrator";
import separateErrorAndSuccessResults from "./separateErrorAndSuccessResults";
import dependencyTree, { Tree } from "dependency-tree";

export function createTsMorphProject(tsConfigFilePath: string) {
  return new Project({
    tsConfigFilePath,
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}

/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
  private filepathToFileMetadata: Record<string, FileMetadata> = {};
  private filepathToDependencyTree: Record<string, Tree> = {};
  private pageNameToPageFile: Record<string, PageFile> = {};
  private siteSettingsFile?: SiteSettingsFile;
  private studioData?: StudioData;
  private paths: UserPaths;
  private layoutOrchestrator: LayoutOrchestrator;

  /** All paths are assumed to be absolute. */
  constructor(
    private project: Project,
    private studioConfig: StudioConfigWithDefaulting,
    private getLocalDataMapping?: () => Record<string, string[]>
  ) {
    this.paths = studioConfig.paths;
    this.initFilepathToDependencyTree();
    this.initFilepathToFileMetadata();
    this.pageNameToPageFile = this.initPageNameToPageFile();
    this.layoutOrchestrator = new LayoutOrchestrator(
      this.paths,
      this.project,
      this.getFileMetadata
    );
  }

  getOrCreatePageFile = (pageName: string): PageFile => {
    const pageFile = this.pageNameToPageFile[pageName];
    if (pageFile) {
      return pageFile;
    }
    return this.createPageFile(pageName);
  };

  private createPageFile = (pageName: string) => {
    const pageEntityFiles = this.getLocalDataMapping?.()[pageName];
    return new PageFile(
      upath.join(this.paths.pages, pageName + ".tsx"),
      this.getFileMetadata,
      this.project,
      this.studioConfig.isPagesJSRepo,
      pageEntityFiles
    );
  };

  getUUIDToFileMetadata() {
    const UUIDToFileMetadata = Object.values(
      this.filepathToFileMetadata
    ).reduce((prev, curr) => {
      prev[curr.metadataUUID] = curr;
      return prev;
    }, {} as Record<string, FileMetadata>);
    return UUIDToFileMetadata;
  }

  /**
   * Given a filepath, performs necessary actions for reloading the file,
   * so that getStudioData returns up to date information.
   *
   * Will remove data for a file if it no longer exists in the filesystem.
   */
  reloadFile(filepath: string) {
    const fileExists = fs.existsSync(filepath);
    if (fileExists) {
      const sourceFile = this.project.getSourceFile(filepath);
      sourceFile?.refreshFromFileSystemSync();
    }

    function basicReload<T>(
      fileMap: Record<string, T>,
      createFile: (name: string) => T
    ) {
      const name = upath.basename(filepath, ".tsx");
      delete fileMap[name];
      if (fileExists) {
        fileMap[name] = createFile(name);
      }
    }

    if (filepath.startsWith(this.paths.components)) {
      if (this.filepathToFileMetadata.hasOwnProperty(filepath)) {
        const originalMetadataUUID =
          this.filepathToFileMetadata[filepath].metadataUUID;
        delete this.filepathToFileMetadata[filepath];
        if (fileExists) {
          this.filepathToFileMetadata[filepath] = {
            ...this.getFileMetadata(filepath),
            metadataUUID: originalMetadataUUID,
          };
        }
      } else if (fileExists) {
        this.filepathToFileMetadata[filepath] = this.getFileMetadata(filepath);
      }
    } else if (filepath.startsWith(this.paths.pages)) {
      basicReload(this.pageNameToPageFile, this.createPageFile);
    } else if (filepath.startsWith(this.paths.layouts)) {
      this.layoutOrchestrator.refreshLayoutFile(filepath, fileExists);
    }
    this.studioData = this.calculateStudioData();
  }

  getStudioData(): StudioData {
    if (!this.studioData) {
      this.studioData = this.calculateStudioData();
    }
    return this.studioData;
  }

  private calculateStudioData(): StudioData {
    const siteSettings = this.getSiteSettings();
    const layoutNameToLayoutState =
      this.layoutOrchestrator.getLayoutNameToLayoutState();
    const pageRecords = separateErrorAndSuccessResults(
      this.pageNameToPageFile,
      (pageFile) => pageFile.getPageState()
    );

    return {
      pageNameToPageState: pageRecords.successes,
      pageNameToErrorPageState: pageRecords.errors,
      layoutNameToLayoutState,
      UUIDToFileMetadata: this.getUUIDToFileMetadata(),
      siteSettings,
      studioConfig: this.studioConfig,
      isWithinCBD: !!process.env.YEXT_CBD_BRANCH,
    };
  }

  private initFilepathToFileMetadata() {
    const assignFilepathToFileMetadata = (absPath: string) => {
      this.filepathToFileMetadata[absPath] = this.getFileMetadata(absPath);
    };
    this.traverseAllFilesInDirectory(
      this.paths.components,
      assignFilepathToFileMetadata
    );
  }

  private initFilepathToDependencyTree() {
    const updateDependencyTree = (absPath: string) => {
      this.updateFilepathToDependencyTree(absPath);
    };
    this.traverseAllFilesInDirectory(
      this.paths.components,
      updateDependencyTree
    );
  }

  /**
   * Takes in a directory and calls fileAction on all
   * files in the directory and its subdirectories.
   */
  private traverseAllFilesInDirectory(
    folderPath: string,
    fileAction: (absPath: string) => void
  ) {
    if (!fs.existsSync(folderPath)) {
      return;
    }
    fs.readdirSync(folderPath, "utf-8").forEach((filename) => {
      const absPath = upath.join(folderPath, filename);
      if (fs.lstatSync(absPath).isDirectory()) {
        this.traverseAllFilesInDirectory(absPath, fileAction);
      } else {
        fileAction(absPath);
      }
    });
  }

  private updateFilepathToDependencyTree(absPath: string) {
    this.filepathToDependencyTree[absPath] = dependencyTree({
      filename: absPath,
      directory: upath.dirname(absPath),
      visited: this.filepathToDependencyTree,
    });
  }

  private getOrCreateDependencyTree(absFilepath: string): Tree {
    if (!this.filepathToDependencyTree.hasOwnProperty(absFilepath)) {
      this.updateFilepathToDependencyTree(absFilepath);
    }
    return this.filepathToDependencyTree[absFilepath];
  }

  private getFileMetadata = (absPath: string): FileMetadata => {
    if (this.filepathToFileMetadata[absPath]) {
      return this.filepathToFileMetadata[absPath];
    }
    const createErrorFileMetadata = (
      error: ParsingError
    ): ErrorFileMetadata => ({
      kind: FileMetadataKind.Error,
      metadataUUID: v4(),
      message: error.message,
      filepath: absPath,
    });

    if (absPath.startsWith(this.paths.components)) {
      const componentFile = new ComponentFile(
        absPath,
        this.project,
        this.getOrCreateDependencyTree(absPath)
      );
      const result = componentFile.getComponentMetadata();
      if (result.isErr) {
        return createErrorFileMetadata(result.error);
      }
      return result.value;
    }

    throw new Error(
      `Could not get FileMetadata for ${absPath}, file does not ` +
        `live inside the expected folder: ${this.paths.components}.`
    );
  };

  private initPageNameToPageFile(): Record<string, PageFile> {
    if (!fs.existsSync(this.paths.pages)) {
      throw new Error(
        `The pages directory does not exist, expected directory to be at "${this.paths.pages}".`
      );
    }
    return createFilenameMapping(this.paths.pages, this.getOrCreatePageFile);
  }

  private getSiteSettings(): SiteSettings | undefined {
    if (!fs.existsSync(this.paths.siteSettings)) {
      return;
    }

    if (!this.siteSettingsFile) {
      this.siteSettingsFile = new SiteSettingsFile(
        this.paths.siteSettings,
        this.project
      );
    }
    return this.siteSettingsFile.getSiteSettings();
  }

  /**
   * Updates the user's site settings file.
   * Assumes that this.siteSettingsFile already exists.
   */
  updateSiteSettings(siteSettingsValues: SiteSettingsValues): void {
    this.siteSettingsFile?.updateSiteSettingValues(siteSettingsValues);
  }
}
