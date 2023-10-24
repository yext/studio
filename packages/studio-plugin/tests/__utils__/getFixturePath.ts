import upath from "upath";

export function getFixturePath(fixturePath: string): string {
  return upath.resolve(__dirname, `../__fixtures__/${fixturePath}`);
}

export function getPagePath(pageName: string): string {
  return getFixturePath(upath.join("PageFile", pageName + ".tsx"));
}

export function getLayoutPath(layoutName: string): string {
  return getFixturePath(upath.join("LayoutFile", layoutName + ".tsx"));
}

export function getComponentPath(componentName: string): string {
  return getFixturePath(upath.join("ComponentFile", componentName + ".tsx"));
}

export function getSiteSettingsPath(fileName = "siteSettings.ts"): string {
  return getFixturePath(upath.join("SiteSettingsFile", fileName));
}

export function getStylePath(fileName: string): string {
  return getFixturePath(upath.join("styles", fileName));
}
