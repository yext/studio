import fs from "fs";
import path from "path";
import typescript, { ModuleResolutionHost } from "typescript";
import { PluginConfig } from "../types";

// "typescript" is a CommonJS module, which may not support all module.exports as named exports
const { resolveModuleName } = typescript;

/**
 * ResolvePlugin is a class for traversing plugin configuration and files
 */
export default class ResolvePlugin {
  private resolvedModule: typescript.ResolvedModuleFull;
  private root: string;

  constructor(private moduleName: string) {
    const { resolvedModule, root } = this.resolveModuleName();
    this.resolvedModule = resolvedModule;
    this.root = root;
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

  getPathToModule(): string {
    const subModule = this.resolvedModule.packageId?.subModuleName || "";
    const stripSubModuleNameFromPath =
      this.resolvedModule.resolvedFileName.replace(subModule, "");
    return path.join(this.root, stripSubModuleNameFromPath);
  }
}
