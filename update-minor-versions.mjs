import { execSync } from "child_process";
import fs from "fs";

function bumpStudioPlugin() {
  console.log("... bumping studio-plugin");
  execSync("npm version minor -w=packages/studio-plugin");
  return readVersion("./packages/studio-plugin/package.json");
}

function bumpStudio(pluginVersion, uiVersion) {
  console.log("... bumping studio");
  const packageJsonPath = "./packages/studio/package.json";
  const packageJson = readJson(packageJsonPath);
  // `npm i @yext/studio-plugin@${newVersion} --save-exact` does not update the package json,
  // likely because the new version does not exist yet.
  packageJson.dependencies["@yext/studio-plugin"] = pluginVersion;
  packageJson.dependencies["@yext/studio-ui"] = uiVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  execSync("npm version minor -w=packages/studio");
}

function bumpStudioUI() {
  console.log("... bumping studio-ui");
  execSync("npm version minor -w=packages/studio-ui");
  return readVersion("./packages/studio-ui/package.json");
}

function readJson(filepath) {
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

function readVersion(packageJsonPath) {
  const packageJson = readJson(packageJsonPath);
  const newVersion = packageJson?.version;
  if (!newVersion) {
    throw new Error(
      `Could not parse version from package.json at ${packageJsonPath}`
    );
  }
  return newVersion;
}

function main() {
  const pluginVersion = bumpStudioPlugin();
  const uiVersion = bumpStudioUI();
  bumpStudio(pluginVersion, uiVersion);
}

main();
