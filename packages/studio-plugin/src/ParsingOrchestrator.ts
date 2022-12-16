import path from "path";
import { ComponentMetadata, FileMetadata, PageState } from "./types";
import fs from "fs";
import ComponentFile from "./sourcefiles/ComponentFile";
import ModuleFile from "./sourcefiles/ModuleFile";
import PageFile from "./sourcefiles/PageFile";
import SiteSettingsFile, { SiteSettings } from "./sourcefiles/SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  UUIDToFileMetadata: Record<string, ComponentMetadata>;
  siteSettings?: SiteSettings;
}

export function createTsMorphProject() {
  return new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}

/**
 * The ts-morph Project instance for the entire app.
 */
const tsMorphProject: Project = createTsMorphProject();

/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
  private filepathToFileMetadata: Record<string, FileMetadata>;

  /** All paths are assumed to be absolute. */
  constructor(
    private paths: {
      components: string;
      pages: string;
      modules: string;
      siteSettings: string;
    }
  ) {
    this.getFileMetadata = this.getFileMetadata.bind(this);
    this.filepathToFileMetadata = this.setFilepathToFileMetadata();
  }

  getStudioData(): StudioData {
    const UUIDToFileMetadata = Object.values(
      this.filepathToFileMetadata
    ).reduce((prev, curr) => {
      prev[curr.metadataUUID] = curr;
      return prev;
    }, {});

    const siteSettings = this.getSiteSettings();
    const pageNameToPageState = this.getPageNameToPageState();

    return {
      pageNameToPageState,
      UUIDToFileMetadata,
      siteSettings,
    };
  }

  private setFilepathToFileMetadata(): Record<string, FileMetadata> {
    this.filepathToFileMetadata = {};

    const addToMapping = (folderPath: string) => {
      if (!fs.existsSync(folderPath)) {
        return;
      }
      fs.readdirSync(folderPath, "utf-8").forEach((filename) => {
        const absPath = path.join(folderPath, filename);
        this.filepathToFileMetadata[absPath] = this.getFileMetadata(absPath);
      });
    };

    addToMapping(this.paths.components);
    addToMapping(this.paths.modules);

    return this.filepathToFileMetadata;
  }

  private getFileMetadata(absPath: string): FileMetadata {
    if (this.filepathToFileMetadata[absPath]) {
      return this.filepathToFileMetadata[absPath];
    }
    if (absPath.startsWith(this.paths.components)) {
      const componentFile = new ComponentFile(absPath, tsMorphProject);
      return componentFile.getComponentMetadata();
    }
    if (absPath.startsWith(this.paths.modules)) {
      const moduleFile = new ModuleFile(
        absPath,
        this.getFileMetadata,
        tsMorphProject
      );
      return moduleFile.getModuleMetadata();
    }
    const { modules, components } = this.paths;
    throw new Error(
      `Could not get FileMetadata for ${absPath}, file does not ` +
        `live inside the expected folders for modules: ${modules} or components: ${components}.`
    );
  }

  private getPageNameToPageState(): Record<string, PageState> {
    if (!fs.existsSync(this.paths.pages)) {
      throw new Error(
        `The pages directory does not exist, expected directory to be at "${this.paths.pages}".`
      );
    }
    return fs.readdirSync(this.paths.pages, "utf-8").reduce((prev, curr) => {
      const pageName = path.basename(curr, ".tsx");
      const pageFile = new PageFile(
        path.join(this.paths.pages, curr),
        this.getFileMetadata,
        tsMorphProject
      );
      prev[pageName] = pageFile.getPageState();
      return prev;
    }, {});
  }

  private getSiteSettings(): SiteSettings | undefined {
    if (!fs.existsSync(this.paths.siteSettings)) {
      return;
    }
    const siteSettingsFile = new SiteSettingsFile(
      this.paths.siteSettings,
      tsMorphProject
    );
    return siteSettingsFile.getSiteSettings();
  }
}
