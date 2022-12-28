import path from "path";
import { StudioPaths } from "../types";

/**
 * Given an absolute path to the user's project root folder, determine
 * the filepaths Studio will use for parsing files.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder
 */
export default function getStudioPaths(pathToProjectRoot: string): StudioPaths {
  const pathToSrc = path.join(pathToProjectRoot, "src");
  return {
    pages: path.join(pathToSrc, "pages"),
    modules: path.join(pathToSrc, "modules"),
    components: path.join(pathToSrc, "components"),
    siteSettings: path.join(pathToSrc, "siteSettings.ts"),
    localData: path.join(pathToProjectRoot, "localData")
  };
}
