import { StudioConfig } from "../types";
import fs from "fs";
import path from "path";
import getUserPaths from "./getUserPaths";
import lodashMerge from "lodash/merge";

type RecursiveRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? RecursiveRequired<T[P]>
    : Required<T[P]>;
};
type RequiredStudioConfig = RecursiveRequired<StudioConfig>;

/**
 * Given an absolute path to the user's project root folder, retrieve Studio's
 * configuration defined in "studio.config.ts" file, if exist. Any unspecified
 * fields will be given a default value.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder
 */
export default async function getStudioConfig(
  pathToProjectRoot: string
): Promise<RequiredStudioConfig> {
  const defaultConfig: RequiredStudioConfig = {
    isPagesJSRepo: false,
    paths: getUserPaths(pathToProjectRoot),
  };
  const configFilepath = path.join(pathToProjectRoot, "studio.config.ts");
  if (!fs.existsSync(configFilepath)) {
    return defaultConfig;
  }

  const studioConfig = (await import(/* @vite-ignore */ configFilepath))
    .default;
  return lodashMerge(defaultConfig, studioConfig);
}
