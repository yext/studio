import path from "path";
import {
  ComponentMetadata,
  FileMetadata,
  ModuleMetadata,
  PageState,
} from "../types";
import fs from "fs";
import ComponentFile from "./ComponentFile";
import ModuleFile from "./ModuleFile";
import PageFile from "./PageFile";
import SiteSettingsFile, { SiteSettings } from "./SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";

export interface StudioData {
  pageNameToPageState: Record<string, PageState>;
  UUIDToFileMetadata: Record<string, ComponentMetadata>;
  siteSettings?: SiteSettings;
}

/**
 * The ts-morph Project instance for the entire app.
 */
const tsMorphProject = new Project({
  compilerOptions: {
    jsx: typescript.JsxEmit.ReactJSX,
  },
});

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
    this.filepathToFileMetadata = this.getFilepathToComponentMetadata();
  }

  getStudioData(): StudioData {
    const UUIDToFileMetadata = Object.values(
      this.filepathToFileMetadata
    ).reduce((prev, curr) => {
      prev[curr.metadataUUID] = curr;
      return prev;
    }, {});
    return {
      pageNameToPageState: this.getPageNameToPageState(),
      UUIDToFileMetadata,
      siteSettings: this.getSiteSettings(),
    };
  }

  private getFilepathToComponentMetadata(): Record<string, FileMetadata> {
    const mapping: Record<string, FileMetadata> = {};

    if (!fs.existsSync(this.paths.components)) {
      return {};
    }
    fs.readdirSync(this.paths.components, "utf-8").forEach((filename) => {
      const absPath = path.join(this.paths.components, filename);
      mapping[absPath] = this.getFileMetadata(absPath);
    });

    if (!fs.existsSync(this.paths.modules)) {
      return mapping;
    }
    fs.readdirSync(this.paths.modules, "utf-8").forEach((filename) => {
      const absPath = path.join(this.paths.modules, filename);
      mapping[absPath] = this.getFileMetadata(absPath);
    });

    return mapping;
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
      `Unknown filepath ${absPath}, expected ${modules} or ${components}.`
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
