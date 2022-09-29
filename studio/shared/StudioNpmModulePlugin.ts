import { PropState } from './models'

export interface ComponentExportConfig {
  /** Component's export identifier. */
  exportIdentifiers: string,
  /** CSS imports required for component to work in PagePreview. */
  cssImports?: string[],
  /** Initial props when component is added to page through Studio. */
  initialProps?: PropState
}

export interface StudioNpmModulePlugin {
  /** name of the NPM module. */
  moduleName: string,
  /**
   * CSS imports required for components from the NPM module to work in PagePreview.
   * The path(s) must be relative paths from project root directory.
   */
  cssImports?: string[],
  /** List of components available to use by Studio. */
  exports: (string | ComponentExportConfig)[],
  /**
   * By default, during development, Vite will crawl through source code to detect
   * dependencies that need to be be converted to ESM during pre-bundling step since
   * Vite's dev serves all code as native ESM.
   *
   * For dynamic import of NPM modules, CommonJS or UMD dependencies may not be
   * discoverable by Vite during pre-bundling step. As such, use "nonEsmDeps" option
   * to include any CommonJS or UMD dependencies. This array will be included as part
   * of Vite's config "optimizedDeps.include" to force the listed dependencies to be
   * pre-bundled.
   */
  nonEsmDeps?: string[]
}
