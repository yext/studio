import fs from "fs";
import upath from "upath";
import typescript, { ModuleResolutionHost } from "typescript";
const { resolveModuleName: resolveTypescriptModule } = typescript;

/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
  private resolvedFilepath: string;

  constructor(
    private importSpecifier: string,
    private initialSearchRoot: string
  ) {
    const searchRootDir = upath.dirname(initialSearchRoot);
    this.resolvedFilepath = this.resolveImportSpecifier(searchRootDir);
  }

  private resolveImportSpecifier(searchRoot: string): string {
    const customModuleResolutionHost: ModuleResolutionHost = {
      fileExists(filepath) {
        return fs.existsSync(upath.join(searchRoot, filepath));
      },
      readFile(filepath) {
        return fs.readFileSync(upath.join(searchRoot, filepath), "utf-8");
      },
    };

    const { resolvedModule } = resolveTypescriptModule(
      this.importSpecifier,
      "",
      {},
      customModuleResolutionHost
    );

    if (!resolvedModule) {
      const isLocalFileImport = this.importSpecifier.startsWith(".");
      const parent = upath.join(searchRoot, "..");
      if (isLocalFileImport || searchRoot === parent) {
        throw Error(
          `The import specifier "${this.importSpecifier}" could not be resolved from ${this.initialSearchRoot}.`
        );
      }
      return this.resolveImportSpecifier(parent);
    }

    return upath.join(searchRoot, resolvedModule.resolvedFileName);
  }

  getResolvedFilepath(): string {
    return this.resolvedFilepath;
  }
}
