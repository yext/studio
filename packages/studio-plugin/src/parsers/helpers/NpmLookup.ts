import fs from "fs";
import path from "path";
import typescript, { ModuleResolutionHost } from "typescript";

// "typescript" is a CommonJS module, which may not support all module.exports as named exports
const { resolveModuleName } = typescript;

/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
  private rootPath: string;
  private resolvedFilepath: string;

  constructor(private moduleName: string) {
    const { resolvedModule, root } = this.resolveModuleName();
    this.rootPath = this.setRootPath(resolvedModule, root);
    this.resolvedFilepath = path.join(root, resolvedModule.resolvedFileName);
  }

  private resolveModuleName(root = process.cwd()): {
    resolvedModule: typescript.ResolvedModuleFull;
    root: string;
  } {
    const customModuleResolutionHost: ModuleResolutionHost = {
      fileExists(fileName) {
        return fs.existsSync(path.join(root, fileName));
      },
      readFile(fileName) {
        return fs.readFileSync(path.join(root, fileName), "utf-8");
      },
    };

    const { resolvedModule } = resolveModuleName(
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

  private setRootPath(
    resolvedModule: typescript.ResolvedModuleFull,
    root: string
  ): string {
    const pathToEntry = resolvedModule.packageId?.subModuleName || "";
    const stripPathToEntryNameFromPath =
      resolvedModule.resolvedFileName.replace(pathToEntry, "");
    return path.join(root, stripPathToEntryNameFromPath);
  }

  getResolvedFilepath(): string {
    return this.resolvedFilepath;
  }

  getRootPath(): string {
    return this.rootPath;
  }
}
