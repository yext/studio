import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function dynamicImport(absFilepath: string): Promise<unknown> {
  const relativeFilepath = getWindowsCompatiblePath(absFilepath);
  return import(relativeFilepath);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function dynamicImportJson(absFilepath: string): Promise<any> {
  const relativeFilepath = getWindowsCompatiblePath(absFilepath);
  const importedModule = await import(relativeFilepath, {
    assert: { type: "json" },
  });
  return importedModule.default;
}

/**
 * We need to use relative paths and also replace backslashes
 * with forward slashes for windows support.
 */
function getWindowsCompatiblePath(absFilepath: string): string {
  return path.relative(__dirname, absFilepath).replaceAll("\\", "/");
}
