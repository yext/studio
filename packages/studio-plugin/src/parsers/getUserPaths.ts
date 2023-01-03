import path from "path";
import { UserPaths } from "../types";

/**
 * Given an absolute path to the user's project root folder, determine
 * the filepaths Studio will use for parsing files.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder.
 */
export default function getUserPaths(pathToProjectRoot: string): UserPaths {
  const pathToSrc = path.join(pathToProjectRoot, "src");
  return {
    pages: path.join(pathToSrc, "pages"),
    modules: path.join(pathToSrc, "modules"),
    components: path.join(pathToSrc, "components"),
    siteSettings: path.join(pathToSrc, "siteSettings.ts"),
  };
}
