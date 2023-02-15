import path from "path";

/**
 * Calculates the import needed to import a file into another;
 *
 * Assumes given paths are absolute.
 */
export default function getImportSpecifier(
  baseFile: string,
  toBeImported: string
) {
  const baseFileDir = path.dirname(baseFile);
  const toBeImportedDir = path.dirname(toBeImported);
  const relativePath = path.relative(baseFileDir, toBeImportedDir);
  const importName = path.parse(toBeImported).name;
  const importPath = path.join(relativePath, importName);
  // We need to add a leading ./ if there is none present.
  if (path.dirname(importPath) === "." && !importPath.startsWith(".")) {
    return "./" + importPath;
  }
  return importPath;
}
