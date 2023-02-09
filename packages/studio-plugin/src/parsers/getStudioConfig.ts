import { PluginConfig, StudioConfig } from "../types";
import fs from "fs";
import path from "path";
import getUserPaths from "./getUserPaths";
import lodash from "lodash";

type RecursiveRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? RecursiveRequired<T[P]>
    : Required<T[P]>;
};
type RequiredStudioConfig = RecursiveRequired<
  Omit<StudioConfig, "plugins"> & {
    plugins: PluginConfig[];
  }
>;

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
    plugins: [],
  };
  const configFilepath = path.join(pathToProjectRoot, "studio.config.ts");
  if (!fs.existsSync(configFilepath)) {
    return defaultConfig;
  }

  const studioConfig = (await import(/* @vite-ignore */ configFilepath))
    .default as StudioConfig;
  studioConfig.plugins =
    studioConfig.plugins && handleDefaultImports(studioConfig.plugins);
  return lodash.merge({}, defaultConfig, studioConfig);
}

function handleDefaultImports(
  pluginImports: (PluginConfig | { default: PluginConfig })[]
): PluginConfig[] {
  return pluginImports.map(function (pluginImport) {
    if ("default" in pluginImport) {
      return pluginImport.default as PluginConfig;
    }

    return pluginImport as PluginConfig;
  });
}
