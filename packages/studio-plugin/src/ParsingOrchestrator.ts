import path from "path";
import {
  FileMetadata,
  UserPaths,
  StudioData,
  PageState,
  SiteSettingsValues,
  SiteSettings,
  PluginConfig,
  PluginRef,
} from "./types";
import fs from "fs";
import ComponentFile from "./sourcefiles/ComponentFile";
import ModuleFile from "./sourcefiles/ModuleFile";
import PageFile from "./sourcefiles/PageFile";
import SiteSettingsFile from "./sourcefiles/SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";
import { NpmLookup } from "./utils";

export function createTsMorphProject() {
  return new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}

/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
  private filepathToFileMetadata: Record<string, FileMetadata>;
  private filepathToModuleFile: Record<string, ModuleFile> = {};
  private pageNameToPageFile: Record<string, PageFile> = {};
  private localDataMapping?: Record<string, string[]>;
  private siteSettingsFile?: SiteSettingsFile;
  private pluginReferences: PluginRef[];

  /** All paths are assumed to be absolute. */
  constructor(
    private project: Project,
    private paths: UserPaths,
    plugins: PluginConfig[],
    private isPagesJSRepo?: boolean
  ) {
    this.getFileMetadata = this.getFileMetadata.bind(this);
    this.getFileMetadataByUUID = this.getFileMetadataByUUID.bind(this);
    this.pluginReferences = this.getPluginRefs(plugins);
    this.filepathToFileMetadata = this.setFilepathToFileMetadata();
  }

  private getPluginRefs(plugins: PluginConfig[] = []): PluginRef[] {
    return plugins.flatMap((plugin: PluginConfig) => {
      const npmModule = new NpmLookup(plugin.name);
      return Object.entries(plugin.components).map(
        ([componentName, filepath]) => ({
          filepath: path.join(npmModule.getEntryPath(), filepath),
          moduleName: plugin.name,
          componentName,
        })
      );
    });
  }

  async getPageFile(pageName: string): Promise<PageFile> {
    const pageFile = this.pageNameToPageFile[pageName];
    if (pageFile) {
      return pageFile;
    }
    let localDataMapping: Record<string, string[]> | undefined =
      this.localDataMapping;
    if (!localDataMapping && this.isPagesJSRepo) {
      localDataMapping = await this.getLocalDataMapping();
    }
    const pageEntityFiles = localDataMapping?.[pageName];
    const newPageFile = new PageFile(
      path.join(this.paths.pages, pageName + ".tsx"),
      this.getFileMetadata,
      this.getFileMetadataByUUID,
      this.project,
      this.pluginReferences,
      pageEntityFiles
    );
    this.pageNameToPageFile[pageName] = newPageFile;
    return newPageFile;
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

  async getStudioData(): Promise<StudioData> {
    const UUIDToFileMetadata = Object.values(
      this.filepathToFileMetadata
    ).reduce((prev, curr) => {
      prev[curr.metadataUUID] = curr;
      return prev;
    }, {});

    const siteSettings = this.getSiteSettings();
    const pageNameToPageState = await this.getPageNameToPageState();

    return {
      pageNameToPageState,
      UUIDToFileMetadata,
      siteSettings,
      userPaths: this.paths,
    };
  }

  private setFilepathToFileMetadata(): Record<string, FileMetadata> {
    this.filepathToFileMetadata = {};

    const addDirectoryToMapping = (folderPath: string) => {
      if (!fs.existsSync(folderPath)) {
        return;
      }
      fs.readdirSync(folderPath, "utf-8").forEach((filename) => {
        const absPath = path.join(folderPath, filename);
        this.filepathToFileMetadata[absPath] = this.getFileMetadata(absPath);
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
    this.pluginReferences.forEach((pluginReference) =>
      addFileToMapping(pluginReference.filepath)
    );

    return this.filepathToFileMetadata;
  }

  private getFileMetadata(absPath: string): FileMetadata {
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
    const pluginRef = this.pluginReferences.find(
      (ref) => ref.filepath === absPath
    );
    if (pluginRef) {
      const componentFile = new ComponentFile(
        absPath,
        this.project,
        pluginRef.moduleName
      );
      return componentFile.getComponentMetadata();
    }
    const { modules, components } = this.paths;
    throw new Error(
      `Could not get FileMetadata for ${absPath}, file does not ` +
        `live inside the expected folders for modules: ${modules}, ${components}, or a plugin.`
    );
  }

  private getFileMetadataByUUID(
    metadataUUID: string
  ): FileMetadata | undefined {
    const fileMetadata = Object.values(this.filepathToFileMetadata).find(
      (fileMetadata) => fileMetadata.metadataUUID === metadataUUID
    );

    if (!fileMetadata) {
      return;
    }

    return fileMetadata;
  }

  private async getLocalDataMapping(): Promise<
    Record<string, string[]> | undefined
  > {
    if (this.localDataMapping) {
      return this.localDataMapping;
    }
    const streamMappingFile = "mapping.json";
    const localDataMappingFilepath = path.join(
      this.paths.localData,
      streamMappingFile
    );
    if (!fs.existsSync(localDataMappingFilepath)) {
      throw new Error(
        `The localData's ${streamMappingFile} does not exist, expected the file to be at "${localDataMappingFilepath}".`
      );
    }
    const mapping = await import(localDataMappingFilepath);
    this.localDataMapping = mapping;
    return mapping;
  }

  private async getPageNameToPageState(): Promise<Record<string, PageState>> {
    if (!fs.existsSync(this.paths.pages)) {
      throw new Error(
        `The pages directory does not exist, expected directory to be at "${this.paths.pages}".`
      );
    }
    const files = fs.readdirSync(this.paths.pages, "utf-8");
    const arrayOfPageNameToStateEntries: [string, PageState][] =
      await Promise.all(
        files.map(async (file) => {
          const pageName = path.basename(file, ".tsx");
          const pageFile = await this.getPageFile(pageName);
          return [pageName, pageFile.getPageState()];
        })
      );
    return Object.fromEntries(arrayOfPageNameToStateEntries);
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
