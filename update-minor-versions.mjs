import { execSync } from "child_process";
import fs from "fs";

function readJson(filepath) {
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

function bumpStudioPlugin() {
  console.log("... bumping studio-plugin");
  execSync("npm version minor -w=packages/studio-plugin");
  const packageJson = readJson("./packages/studio-plugin/package.json");
  const newVersion = packageJson?.version;
  if (!newVersion) {
    throw new Error("Could not parse studio-plugin version from package.json");
  }
  return newVersion;
}

function bumpStudio(newVersion) {
  console.log("... bumping studio");
  const packageJsonPath = "./packages/studio/package.json";
  const packageJson = readJson(packageJsonPath);
  // `npm i @yext/studio-plugin@${newVersion} --save-exact` does not update the package json,
  // likely because the new version does not exist yet.
  packageJson.dependencies["@yext/studio-plugin"] = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  execSync("npm version minor -w=packages/studio");
}

function main() {
  const newVersion = bumpStudioPlugin();
  bumpStudio(newVersion);
}

main();
