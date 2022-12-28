import { StudioConfig } from "../types";
import fs from "fs";
import path from "path";

/**
 * Given an absolute path to the user's project root folder, retrieve Studio's
 * configuration defined in "studioconfig.json" file, if exist.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder
 */
export default async function getStudioConfig(pathToProjectRoot: string): Promise<StudioConfig> {
  const configFilepath = path.join(pathToProjectRoot, "studioconfig.json")
  if (!fs.existsSync(configFilepath)) {
    return {};
  }
  return (await import(configFilepath)).default
}