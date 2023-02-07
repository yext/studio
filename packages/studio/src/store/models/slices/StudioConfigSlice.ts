import { UserPaths } from "@yext/studio-plugin";

/**
 * Keeps track of the state of the application at the time of the last commit.
 * Currently only siteSettings is tracked here.
 */
export default interface StudioConfigSlice {
  paths: UserPaths;
}
