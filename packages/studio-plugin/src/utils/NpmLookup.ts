import fs from "fs";
import path from "path";
import typescript, { ModuleResolutionHost } from "typescript";

// "typescript" is a CommonJS module, which may not support all module.exports as named exports
const { resolveModuleName } = typescript;

/**
 * NpmLookup is a class for retrieving information on an installed node module
 */
export default class NpmLookup {
  private entryPath: string;

  constructor(private moduleName: string) {
    const { resolvedModule, root } = this.resolveModuleName();
    this.entryPath = this.setEntryPath(resolvedModule, root);
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

  private setEntryPath(
    resolvedModule: typescript.ResolvedModuleFull,
    root: string
  ): string {
    const subModule = resolvedModule.packageId?.subModuleName || "";
    const stripSubModuleNameFromPath = resolvedModule.resolvedFileName.replace(
      subModule,
      ""
    );
    return path.join(root, stripSubModuleNameFromPath);
  }

  getEntryPath(): string {
    return this.entryPath;
  }
}
