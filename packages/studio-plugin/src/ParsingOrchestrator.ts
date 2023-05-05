import path from "path";
import {
  FileMetadata,
  UserPaths,
  StudioData,
  SiteSettingsValues,
  SiteSettings,
  PluginConfig,
} from "./types";
import fs from "fs";
import ComponentFile from "./sourcefiles/ComponentFile";
import ModuleFile from "./sourcefiles/ModuleFile";
import PageFile from "./sourcefiles/PageFile";
import SiteSettingsFile from "./sourcefiles/SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";
import NpmLookup from "./parsers/helpers/NpmLookup";
import { RequiredStudioConfig } from "./parsers/getStudioConfig";
import prettyPrintError from "./errors/prettyPrintError";

export function createTsMorphProject() {
  return new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}

export type PluginComponentData = {
  componentName: string;
  moduleName: string;
};

/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
  private filepathToFileMetadata: Record<string, FileMetadata>;
  private filepathToModuleFile: Record<string, ModuleFile> = {};
  private pageNameToPageFile: Record<string, PageFile> = {};
  private siteSettingsFile?: SiteSettingsFile;
  private filepathToPluginComponentData: Record<string, PluginComponentData>;
  private studioData?: StudioData;
  private paths: UserPaths;

  /** All paths are assumed to be absolute. */
  constructor(
    private project: Project,
    private studioConfig: RequiredStudioConfig,
    private localDataMapping?: Record<string, string[]>
  ) {
    this.filepathToPluginComponentData = initFilepathToPluginNames(
      studioConfig.plugins
    );
    this.paths = studioConfig.paths;
    this.filepathToFileMetadata = this.initFilepathToFileMetadata();
    this.pageNameToPageFile = this.initPageNameToPageFile();
  }

  getPageFile(pageName: string): PageFile {
    const pageFile = this.pageNameToPageFile[pageName];
    if (pageFile) {
      return pageFile;
    }
    return this.createPageFile(pageName);
  }

  private createPageFile(pageName: string) {
    const pageEntityFiles = this.localDataMapping?.[pageName];
    return new PageFile(
      path.join(this.paths.pages, pageName + ".tsx"),
      this.getFileMetadata,
      this.getFileMetadataByUUID,
      this.project,
      this.filepathToPluginComponentData,
      pageEntityFiles
    );
  }

  getModuleFile(filepath: string): ModuleFile {
    const moduleFile = this.filepathToModuleFile[filepath];
    if (moduleFile) {
      return moduleFile;
    }
    const newModuleFile = new ModuleFile(
      filepath,
      this.getFileMetadata,
      this.getFileMetadataByUUID,
      this.project
    );
    this.filepathToModuleFile[filepath] = newModuleFile;
    return newModuleFile;
  }

  getUUIDToFileMetadata() {
    const UUIDToFileMetadata = Object.values(
      this.filepathToFileMetadata
    ).reduce((prev, curr) => {
      prev[curr.metadataUUID] = curr;
      return prev;
    }, {});
    return UUIDToFileMetadata;
  }

  /**
   * Given a filepath, performs necessary actions for reloading the file,
   * so that getStudioData returns up to date information.
   *
   * Will remove data for a file if it no longer exists in the filesystem.
   */
  reloadFile(filepath: string) {
    const sourceFile = this.project.getSourceFile(filepath);

    if (sourceFile) {
      sourceFile.refreshFromFileSystemSync();
    }

    if (
      filepath.startsWith(this.paths.modules) ||
      filepath.startsWith(this.paths.components)
    ) {
      if (this.filepathToFileMetadata.hasOwnProperty(filepath)) {
        const originalMetadataUUID =
          this.filepathToFileMetadata[filepath].metadataUUID;
        delete this.filepathToFileMetadata[filepath];
        if (sourceFile) {
          this.filepathToFileMetadata[filepath] = {
            ...this.getFileMetadata(filepath),
            metadataUUID: originalMetadataUUID,
          };
        }
      } else if (sourceFile) {
        this.filepathToFileMetadata[filepath] = this.getFileMetadata(filepath);
      }
    } else if (filepath.startsWith(this.paths.pages)) {
      const pageName = path.basename(filepath, ".tsx");
      delete this.pageNameToPageFile[pageName];
      if (sourceFile) {
        this.pageNameToPageFile[pageName] = this.getPageFile(pageName);
      }
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
    const pageNameToPageState = Object.keys(this.pageNameToPageFile).reduce(
      (prev, curr) => {
        const pageStateResult = this.pageNameToPageFile[curr].getPageState();

        // TODO(SLAP-2686): Confirm behavior for failure case with Product.
        if (pageStateResult.isOk) {
          prev[curr] = pageStateResult.value;
        } else {
          prettyPrintError(
            `Failed to get PageState for "${curr}"`,
            pageStateResult.error.stack
          );
        }

        return prev;
      },
      {}
    );

    return {
      pageNameToPageState,
      UUIDToFileMetadata: this.getUUIDToFileMetadata(),
      siteSettings,
      studioConfig: this.studioConfig,
    };
  }

  private initFilepathToFileMetadata(): Record<string, FileMetadata> {
    this.filepathToFileMetadata = {};

    const addDirectoryToMapping = (folderPath: string) => {
      if (!fs.existsSync(folderPath)) {
        return;
      }
      fs.readdirSync(folderPath, "utf-8").forEach((filename) => {
        const absPath = path.join(folderPath, filename);
        if (fs.lstatSync(absPath).isDirectory()) {
          addDirectoryToMapping(absPath);
        } else {
          this.filepathToFileMetadata[absPath] = this.getFileMetadata(absPath);
        }
      });
    };

    const addFileToMapping = (filePath: string) => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }
      this.filepathToFileMetadata[filePath] = this.getFileMetadata(filePath);
    };

    addDirectoryToMapping(this.paths.components);
    addDirectoryToMapping(this.paths.modules);
    Object.keys(this.filepathToPluginComponentData).forEach((pluginFile) =>
      addFileToMapping(pluginFile)
    );

    return this.filepathToFileMetadata;
  }

  private getFileMetadata = (absPath: string): FileMetadata => {
    if (this.filepathToFileMetadata[absPath]) {
      return this.filepathToFileMetadata[absPath];
    }
    if (absPath.startsWith(this.paths.components)) {
      const componentFile = new ComponentFile(absPath, this.project);
      return componentFile.getComponentMetadata();
    }
    if (absPath.startsWith(this.paths.modules)) {
      const moduleFile = this.getModuleFile(absPath);
      return moduleFile.getModuleMetadata();
    }
    const plugin = this.filepathToPluginComponentData[absPath];
    if (plugin?.moduleName) {
      const componentFile = new ComponentFile(
        absPath,
        this.project,
        plugin.moduleName
      );
      return componentFile.getComponentMetadata();
    }
    const { modules, components } = this.paths;
    throw new Error(
      `Could not get FileMetadata for ${absPath}, file does not ` +
        `live inside the expected folders for modules: ${modules}, ${components}, or a plugin.`
    );
  };

  private getFileMetadataByUUID = (
    metadataUUID: string
  ): FileMetadata | undefined => {
    return Object.values(this.filepathToFileMetadata).find(
      (fileMetadata) => fileMetadata.metadataUUID === metadataUUID
    );
  };

  private initPageNameToPageFile(): Record<string, PageFile> {
    if (!fs.existsSync(this.paths.pages)) {
      throw new Error(
        `The pages directory does not exist, expected directory to be at "${this.paths.pages}".`
      );
    }
    const files = fs.readdirSync(this.paths.pages, "utf-8");
    return files.reduce((pageMap, filename) => {
      const pageName = path.basename(filename, ".tsx");
      pageMap[pageName] = this.getPageFile(pageName);
      return pageMap;
    }, {} as Record<string, PageFile>);
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

function initFilepathToPluginNames(
  plugins: PluginConfig[] = []
): Record<string, PluginComponentData> {
  const filepathToPluginNames = {};

  plugins.forEach((plugin: PluginConfig) => {
    const npmModule = new NpmLookup(plugin.name);
    Object.entries(plugin.components).forEach(([componentName, filepath]) => {
      const absPath = path.join(npmModule.getRootPath(), filepath);
      filepathToPluginNames[absPath] = {
        moduleName: plugin.name,
        componentName,
      };
    });
  });

  return filepathToPluginNames;
}
