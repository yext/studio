import {
  StudioConfig,
  StudioConfigDefaults,
  StudioConfigWithDefaulting,
} from "../types/index.js";
import fs from "fs";
import path from "path";
import getUserPaths from "./getUserPaths.js";
import lodash from "lodash";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError.js";
import { FileIOError, IOErrorKind } from "../errors/FileIOError.js";
import { StudioError } from "../errors/StudioError.js";
import prettyPrintError from "../errors/prettyPrintError.js";

/**
 * Given an absolute path to the user's project root folder, retrieve Studio's
 * configuration defined in "studio.config.js" file, if exist. Any unspecified
 * fields will be given a default value.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder
 * @throws {@link ParsingError|FileIOError}
 */
export default async function getStudioConfig(
  pathToProjectRoot: string
): Promise<StudioConfigWithDefaulting> {
  try {
    return getStudioConfigInternal(pathToProjectRoot);
  } catch (err: unknown) {
    err instanceof StudioError &&
      prettyPrintError("Failed to start Studio", err.message);
    throw err;
  }
}

async function getStudioConfigInternal(
  pathToProjectRoot: string
): Promise<StudioConfigWithDefaulting> {
  const defaultConfig: StudioConfigDefaults = {
    isPagesJSRepo: false,
    paths: getUserPaths(pathToProjectRoot),
    port: 8080,
  };

  // const configFilepath = path.join(pathToProjectRoot, "studio.config.js");
  const configFilepath = "file:///C:\\Users\\olive\\Documents\\Github\\studio-prototype\\apps\\test-site\\studio.config.js"
  console.log('configFilepath', configFilepath)
  if (!fs.existsSync(configFilepath)) {
    return defaultConfig;
  }
  const studioConfig = await importExistingConfig(configFilepath);

  return lodash.merge({}, defaultConfig, studioConfig);
}

/**
 * Imports the Studio Config at the specified filepath.
 *
 * @param filepath - The location of the Studio Config.
 * @throws {@link ParsingError|FileIOError}
 */
async function importExistingConfig(filepath: string): Promise<StudioConfig> {
  let importedFile;
  try {
    importedFile = await import(/* @vite-ignore */ filepath);
  } catch (err) {
    const importError = new FileIOError(
      IOErrorKind.FailedToImportFile,
      `Failed to import module at ${filepath}`,
      err instanceof Error ? err.stack : undefined
    );
    throw importError;
  }

  const studioConfig = importedFile.default as StudioConfig;
  if (!studioConfig) {
    const parsingError = new ParsingError(
      ParsingErrorKind.InvalidStudioConfig,
      "Studio Config must be a default export"
    );
    throw parsingError;
  }

  return studioConfig;
}
