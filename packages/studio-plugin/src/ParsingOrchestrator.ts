import path from "path";
import { FileMetadata, PageState, UserPaths, StudioData } from "./types";
import fs from "fs";
import ComponentFile from "./sourcefiles/ComponentFile";
import ModuleFile from "./sourcefiles/ModuleFile";
import PageFile from "./sourcefiles/PageFile";
import SiteSettingsFile, { SiteSettings } from "./sourcefiles/SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";

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

  /** The ts-morph Project instance for the entire app. */
  private project: Project;

  /** All paths are assumed to be absolute. */
  constructor(private paths: UserPaths) {
    this.project = createTsMorphProject();
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
      userPaths: this.paths,
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
      const componentFile = new ComponentFile(absPath, this.project);
      return componentFile.getComponentMetadata();
    }
    if (absPath.startsWith(this.paths.modules)) {
      const moduleFile = new ModuleFile(
        absPath,
        this.getFileMetadata,
        this.project
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
        this.project
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
      this.project
    );
    return siteSettingsFile.getSiteSettings();
  }
}
