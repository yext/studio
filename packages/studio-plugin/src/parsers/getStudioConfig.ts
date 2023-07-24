import { CliArgs, StudioConfig, StudioConfigWithDefaulting } from "../types";
import fs from "fs";
import upath from "upath";
import getUserPaths from "./getUserPaths";
import lodash from "lodash";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError";
import { FileIOError, IOErrorKind } from "../errors/FileIOError";
import { StudioError } from "../errors/StudioError";
import prettyPrintError from "../errors/prettyPrintError";
import { dynamicImport } from "../utils/dynamicImport";

/**
 * Given an absolute path to the user's project root folder, retrieve Studio's
 * configuration defined in "studio.config.js" file, if exist. Any unspecified
 * fields will be given a default value.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder
 * @throws {@link ParsingError|FileIOError}
 */
export default async function getStudioConfig(
  pathToProjectRoot: string,
  cliArgs: CliArgs = {}
): Promise<StudioConfigWithDefaulting> {
  try {
    const config = await getStudioConfigInternal(pathToProjectRoot, cliArgs);
    return normalizePaths(config, pathToProjectRoot);
  } catch (err: unknown) {
    err instanceof StudioError &&
      prettyPrintError("Failed to start Studio", err.message);
    throw err;
  }
}

async function getStudioConfigInternal(
  pathToProjectRoot: string,
  cliArgs: CliArgs
): Promise<StudioConfigWithDefaulting> {
  const defaultConfig: StudioConfigWithDefaulting = {
    isPagesJSRepo: false,
    paths: getUserPaths(pathToProjectRoot),
    port: 8080,
    openBrowser: true,
  };
  const absConfigFilepath = upath.join(pathToProjectRoot, "studio.config.js");
  if (!fs.existsSync(absConfigFilepath)) {
    return defaultConfig;
  }
  const studioConfig = await importExistingConfig(absConfigFilepath);

  const mergedConfig: StudioConfigWithDefaulting = lodash.merge(
    {},
    defaultConfig,
    studioConfig,
    {
      port: cliArgs.port,
    }
  );
  return mergedConfig;
}

/**
 * Converts paths to normalized absolute paths.
 */
function normalizePaths(
  config: StudioConfigWithDefaulting,
  pathToProjectRoot: string
): StudioConfigWithDefaulting {
  const updatedConfig = lodash.cloneDeep(config);

  Object.keys(updatedConfig.paths).forEach((pathType) => {
    const userPath: string = updatedConfig.paths[pathType];
    if (!upath.isAbsolute(userPath)) {
      updatedConfig.paths[pathType] = upath.join(pathToProjectRoot, userPath);
    }
    updatedConfig.paths[pathType] = upath.normalize(
      updatedConfig.paths[pathType]
    );
  });

  return updatedConfig;
}

/**
 * Imports the Studio Config at the specified filepath.
 *
 * @param absFilepath - An absolute path to the location of the Studio Config.
 * @throws {@link ParsingError|FileIOError}
 */
async function importExistingConfig(
  absFilepath: string
): Promise<StudioConfig> {
  let importedFile;
  try {
    importedFile = await dynamicImport(absFilepath);
  } catch (err) {
    const importError = new FileIOError(
      IOErrorKind.FailedToImportFile,
      `Failed to import module at ${absFilepath}`,
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
