import path from "path-browserify";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * In order to support dynamic imports from the browser on Windows,
 * we need to add an `@fs` prefix to all imports.
 *
 * Otherwise, a `Not allowed to load local resource` error will be logged.
 */
export default function dynamicImportFromBrowser(
  absFilepath: string
): Promise<any> {
  const importPath = path.join("/@fs", absFilepath);
  return import(/* @vite-ignore */ importPath);
}
