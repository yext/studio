import path from "path";

function getFixturePath(fixturePath: string): string {
  return path.resolve(
    __dirname,
    `../__fixtures__/${fixturePath}.tsx`
  );
}

export function getPagePath(pageName: string) {
  return getFixturePath("PageFile/" + pageName);
}

export function getComponentPath(componentName: string) {
  return getFixturePath("ComponentFile/" + componentName);
}
