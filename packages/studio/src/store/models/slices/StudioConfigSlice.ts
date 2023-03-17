import { UserPaths } from "@yext/studio-plugin";

/**
 * A slice for containing data sourced from the user's studio.config.js.
 */
export default interface StudioConfigSlice {
  paths: UserPaths;
  isPagesJSRepo: boolean;
}
