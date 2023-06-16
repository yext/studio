import fs from "fs";
import path from "path";
import typescript, { ModuleResolutionHost } from "typescript";

// "typescript" is a CommonJS module, which may not support all module.exports as named exports
const { resolveModuleName: resolveTypescriptModule } = typescript;
/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
  private resolvedFilepath: string;

  constructor(private moduleName: string, private rootPath: string) {
    const { resolvedModule, root } = this.resolveModuleName();
    this.resolvedFilepath = path.join(root, resolvedModule.resolvedFileName);
  }

  private resolveModuleName(root = this.rootPath): {
    resolvedModule: typescript.ResolvedModuleFull;
    root: string;
  } {
    const customModuleResolutionHost: ModuleResolutionHost = {
      fileExists(filepath) {
        console.log('fileexists', filepath, root)
        return fs.existsSync(path.join(root, filepath));
      },
      readFile(fileName) {
        console.log('readfile', fileName)
        return fs.readFileSync(path.join(root, fileName), "utf-8");
      },
    };

    const { resolvedModule } = resolveTypescriptModule(
      this.moduleName,
      "",
      {},
      customModuleResolutionHost
    );

    if (!resolvedModule) {
      const parent = path.normalize(path.join(root, ".."));
      if (root === parent) {
        throw Error(`The npm package "${this.moduleName}" was not found.`);
      }
      return this.resolveModuleName(parent);
    }

    return {
      resolvedModule,
      root,
    };
  }

  getResolvedFilepath(): string {
    return this.resolvedFilepath;
  }

  getRootPath(): string {
    return this.rootPath;
  }
}
