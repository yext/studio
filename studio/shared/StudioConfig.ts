import { StudioNpmModulePlugin } from './StudioNpmModulePlugin'

export interface StudioConfig {
  plugins: StudioNpmModulePlugin[],
  dirs: {
    pagesDir: string
  }
}
