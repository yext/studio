import upath from "upath";

/**
 * Calculates the import needed to import a file into another.
 *
 * Assumes given paths are absolute.
 */
export function getImportSpecifier(
  baseFilePath: string,
  filePathToBeImported: string
) {
  const baseFileDir = upath.dirname(baseFilePath);
  const toBeImportedDir = upath.dirname(filePathToBeImported);
  const relativePath = upath.relative(baseFileDir, toBeImportedDir);
  const importName = upath.parse(filePathToBeImported).name;
  const importPath = upath.join(relativePath, importName);
  // We need to add a leading ./ if there is none present.
  if (upath.dirname(importPath) === "." && !importPath.startsWith(".")) {
    return "./" + importPath;
  }
  return importPath;
}

/**
 * Calculates the import needed to import a file into another,
 * including the extension.
 *
 * Assumes given paths are absolute.
 */
export function getImportSpecifierWithExtension(
  baseFilePath: string,
  filePathToBeImported: string
) {
  const extension = upath.extname(filePathToBeImported);
  return getImportSpecifier(baseFilePath, filePathToBeImported) + extension;
}
