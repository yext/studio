import path from 'path'
import { ComponentMetadata, FileMetadata, ModuleMetadata, PageState, PropShape, PropValues } from '../types';
import fs from 'fs'
import { v4 } from 'uuid'
import ComponentFile from './ComponentFile';
import ModuleFile from './ModuleFile';
import PageFile from './PageFile';
import SiteSettingsFile, { SiteSettings } from './SiteSettingsFile';

export interface StudioData {
  pages: {
    [pageName: string]: PageState;
  },
  componentMetadata: ComponentMetadata[]
  moduleMetadata: ModuleMetadata[],
  siteSettings?: SiteSettings
}

/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
  /** All paths are assumed to be absolute. */
  constructor(private paths: {
    components: string,
    pages: string,
    modules: string,
    siteSettings: string
  }) {}

  getComponentMetadata(): StudioData['componentMetadata'] {
    if (!fs.existsSync(this.paths.components)) {
      return []
    }
    return fs.readdirSync(this.paths.components, 'utf-8').map(filename => {
      const componentFile = new ComponentFile(path.join(this.paths.components, filename))
      return componentFile.getComponentMetadata();
    })
  }

  getModuleMetadata(): StudioData['moduleMetadata'] {
    if (!fs.existsSync(this.paths.modules)) {
      return []
    }
    return fs.readdirSync(this.paths.modules, 'utf-8').map(filename => {
      const componentFile = new ModuleFile(path.join(this.paths.modules, filename))
      return componentFile.getModuleMetadata();
    })
  }

  getPages(): StudioData['pages'] {
    if (!fs.existsSync(this.paths.pages)) {
      throw new Error(`The pages directory does not exist, expected directory to be at "${this.paths.pages}".`)
    }
    return fs.readdirSync(this.paths.pages, 'utf-8').reduce((prev, curr) => {
      const pageName = path.basename(curr, '.tsx');
      const pageFile = new PageFile(path.join(this.paths.pages, curr));
      prev[pageName] = pageFile.getPageState()
      return prev
    }, {})
  }

  getSiteSettings(): StudioData['siteSettings'] {
    if (!fs.existsSync(this.paths.siteSettings)) {
      return
    }
    return new SiteSettingsFile(this.paths.siteSettings).getSiteSettings()
  }
}