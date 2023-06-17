import fs from "fs";
import path from "path";
import typescript, { ModuleResolutionHost } from "typescript";
const { resolveModuleName: resolveTypescriptModule } = typescript;

type ModuleResolutionData = {
  resolvedModule: typescript.ResolvedModuleFull;
  resolvedRoot: string;
};

/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
  private resolvedFilepath: string;

  constructor(private importSpecifier: string, private initialSearchRoot: string) {
    const { resolvedModule, resolvedRoot } =
      this.resolveImportSpecifier(initialSearchRoot);
    this.resolvedFilepath = path.join(
      resolvedRoot,
      resolvedModule.resolvedFileName
    );
  }

  private resolveImportSpecifier(searchRoot: string): ModuleResolutionData {
    const customModuleResolutionHost: ModuleResolutionHost = {
      fileExists(filepath) {
        return fs.existsSync(path.join(searchRoot, filepath));
      },
      readFile(filepath) {
        return fs.readFileSync(path.join(searchRoot, filepath), "utf-8");
      },
    };

    const { resolvedModule } = resolveTypescriptModule(
      this.importSpecifier,
      "",
      {},
      customModuleResolutionHost
    );

    if (!resolvedModule) {
      const parent = path.normalize(path.join(searchRoot, ".."));
      const isRelativeImport = this.importSpecifier.startsWith(".");
      if (isRelativeImport || searchRoot === parent) {
        throw Error(
          `The import specifier "${this.importSpecifier}" could not be resolved from ${this.initialSearchRoot}.`
        );
      }
      return this.resolveImportSpecifier(parent);
    }

    return {
      resolvedModule,
      resolvedRoot: searchRoot,
    };
  }

  getResolvedFilepath(): string {
    return this.resolvedFilepath;
  }
}
