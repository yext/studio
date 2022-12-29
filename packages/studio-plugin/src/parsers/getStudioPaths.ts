import path from "path";
import { UserPaths } from "../types";

/**
 * Given an absolute path to the user's src folder, determine the filepaths Studio will
 * use for parsing files.
 *
 * @param pathToSrc - An absolute path to the src folder
 */
export default function getStudioPaths(pathToSrc: string): UserPaths {
  return {
    pages: path.join(pathToSrc, "pages"),
    modules: path.join(pathToSrc, "modules"),
    components: path.join(pathToSrc, "components"),
    siteSettings: path.join(pathToSrc, "siteSettings.ts"),
  };
}
