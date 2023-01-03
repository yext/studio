import path from "path";
import { UserPaths } from "../types";

/**
 * Given an absolute path to the user's project root folder, determine
 * the filepaths Studio will use for parsing files.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder.
 * @param userPathsConfig - user paths specified in studio config file
 */
export default function getUserPaths(
  pathToProjectRoot: string,
  userPathsConfig?: Partial<UserPaths>
): UserPaths {
  const pathToSrc = path.join(pathToProjectRoot, "src");
  return {
    pages: path.join(pathToSrc, "pages"),
    modules: path.join(pathToSrc, "modules"),
    components: path.join(pathToSrc, "components"),
    siteSettings: path.join(pathToSrc, "siteSettings.ts"),
    localData: path.join(pathToProjectRoot, "localData"),
    ...userPathsConfig
  };
}
