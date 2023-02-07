import { UserPaths } from "@yext/studio-plugin";

/**
 * A slice for containing data sourced from the user's studio.config.ts.
 */
export default interface StudioConfigSlice {
  paths: UserPaths;
}
