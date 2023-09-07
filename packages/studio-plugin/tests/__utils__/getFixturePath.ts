import upath from "upath";

function getFixturePath(fixturePath: string): string {
  return upath.resolve(__dirname, `../__fixtures__/${fixturePath}`);
}

export function getPagePath(pageName: string): string {
  return getFixturePath(upath.join("PageFile", pageName + ".tsx"));
}

export function getComponentPath(componentName: string): string {
  return getFixturePath(upath.join("ComponentFile", componentName + ".tsx"));
}

export function getModulePath(moduleName: string): string {
  return getFixturePath(upath.join("ModuleFile", moduleName + ".tsx"));
}

export function getSiteSettingsPath(fileName = "siteSettings.ts"): string {
  return getFixturePath(upath.join("SiteSettingsFile", fileName));
}
