import upath from "upath";
import { UserPaths } from "../types";

/**
 * Given an absolute path to the user's project root folder, determine
 * the filepaths Studio will use for parsing files.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder.
 */
export default function getUserPaths(pathToProjectRoot: string): UserPaths {
  const pathToSrc = upath.join(pathToProjectRoot, "src");
  return {
    pages: upath.join(pathToSrc, "pages"),
    modules: upath.join(pathToSrc, "modules"),
    components: upath.join(pathToSrc, "components"),
    siteSettings: upath.join(pathToSrc, "siteSettings.ts"),
    localData: upath.join(pathToProjectRoot, "localData"),
  };
}
