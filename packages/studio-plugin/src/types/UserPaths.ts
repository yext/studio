/**
 * Absolute paths for files and directories in the user's file system that are
 * relevant for Studio.
 */
export interface UserPaths {
  /** The absolute path to the directory with the user's components. */
  components: string;
  /** The absolute path to the directory with the user's pages. */
  pages: string;
  /** The absolute path to the directory with the user's modules. */
  modules: string;
  /** The absolute path to the file with the user's site settings. */
  siteSettings: string;
  /** The absolute path to the directory with local entity data. */
  localData: string;
}
