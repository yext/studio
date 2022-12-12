import path from "path";

function getFixturePath(fixturePath: string): string {
  return path.resolve(
    __dirname,
    `../__fixtures__/${fixturePath}.tsx`
  );
}

export function getPagePath(pageName: string): string {
  return getFixturePath("PageFile/" + pageName);
}

export function getComponentPath(componentName: string): string {
  return getFixturePath("ComponentFile/" + componentName);
}

export function getModulePath(moduleName: string): string {
  return getFixturePath("ModuleFile/" + moduleName);
}
