import { PluginDeclaration } from "./Plugin";
import { UserPaths } from "./UserPaths";

/**
 * User configurations for Studio. Expected to be defined in
 * "studio.config.ts" file of the user's project root folder.
 */
export interface StudioConfig {
  /**
   * Indicates if the user's repo is a PagesJS repository.
   * Default to false.
   */
  isPagesJSRepo?: boolean;
  /**
   * Filepaths that Studio will use for parsing files.
   * Default to:
   * \{
   *  components:   `{pathToUserProjectRoot}/src/components`
   *  pages:        `{pathToUserProjectRoot}/src/pages`
   *  modules:      `{pathToUserProjectRoot}/src/modules`
   *  siteSettings: `{pathToUserProjectRoot}/src/siteSettings.ts`
   *  localData:    `{pathToUserProjectRoot}/localData`
   * \}
   */
  paths?: Partial<UserPaths>;
  plugins?: PluginDeclaration[];
}
