import path from "path";

/**
 * Calculates the import needed to import a file into another;
 *
 * Assumes given paths are absolute.
 */
export default function getImportSpecifier(
  baseFilePath: string,
  filePathToBeImported: string
) {
  const baseFileDir = path.dirname(baseFilePath);
  const toBeImportedDir = path.dirname(filePathToBeImported);
  const relativePath = path.relative(baseFileDir, toBeImportedDir);
  const importName = path.parse(filePathToBeImported).name;
  const importPath = path.join(relativePath, importName);
  // We need to add a leading ./ if there is none present.
  if (path.dirname(importPath) === "." && !importPath.startsWith(".")) {
    return "./" + importPath;
  }
  return importPath;
}
