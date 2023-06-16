import fs from "fs";
import path from "path";
import typescript, { ModuleResolutionHost } from "typescript";
const { resolveModuleName: resolveTypescriptModule } = typescript;

/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
  private resolvedFilepath: string;

  constructor(private importSpecifier: string, rootPath: string) {
    const { resolvedModule, root } = this.resolveImportSpecifier(rootPath);
    this.resolvedFilepath = path.join(root, resolvedModule.resolvedFileName);
  }

  private resolveImportSpecifier(root: string): {
    resolvedModule: typescript.ResolvedModuleFull;
    root: string;
  } {
    const customModuleResolutionHost: ModuleResolutionHost = {
      fileExists(filepath) {
        return fs.existsSync(path.join(root, filepath));
      },
      readFile(filepath) {
        return fs.readFileSync(path.join(root, filepath), "utf-8");
      },
    };

    const { resolvedModule } = resolveTypescriptModule(
      this.importSpecifier,
      "",
      {},
      customModuleResolutionHost
    );

    if (!resolvedModule) {
      const parent = path.normalize(path.join(root, ".."));
      if (root === parent) {
        throw Error(
          `The import specifier "${this.importSpecifier}" could not be resolved.`
        );
      }
      return this.resolveImportSpecifier(parent);
    }

    return {
      resolvedModule,
      root,
    };
  }

  getResolvedFilepath(): string {
    return this.resolvedFilepath;
  }
}
