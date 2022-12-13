import path from "path";

function getFixturePath(fixturePath: string): string {
  return path.resolve(__dirname, `../__fixtures__/${fixturePath}`);
}

export function getPagePath(pageName: string): string {
  return getFixturePath(path.join("PageFile", pageName + ".tsx"));
}

export function getComponentPath(componentName: string): string {
  return getFixturePath(path.join("ComponentFile", componentName + ".tsx"));
}

export function getModulePath(moduleName: string): string {
  return getFixturePath(path.join("ModuleFile", moduleName + ".tsx"));
}

export function getSiteSettingsPath(fileName = "siteSettings.ts"): string {
  return getFixturePath(path.join("SiteSettingsFile", fileName));
}
