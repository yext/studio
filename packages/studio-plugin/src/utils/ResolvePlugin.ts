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
  private moduleName: string;
  resolvedModule: typescript.ResolvedModuleFull;
  root: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
    const { resolvedModule, root } = this.resolveModuleName(moduleName);
    this.resolvedModule = resolvedModule;
    this.root = root;
  }

  resolveModuleName(
    moduleName: string,
    root = process.cwd()
  ): {
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
      moduleName,
      "",
      {},
      customModuleResolutionHost
    );

    if (!resolvedModule) {
      const parent = path.normalize(path.join(root, ".."));
      if (root === parent) {
        throw Error(`The npm package "${moduleName}" was not found.`);
      }
      return this.resolveModuleName(moduleName, parent);
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

  getPathToConfig(): string {
    return path.join(this.root, this.resolvedModule.resolvedFileName);
  }

  async getPathToComponent(name: string): Promise<string> {
    const pathToComponent = await this.getConfig().then(
      (config) => config.components[name]
    );

    if (!pathToComponent) {
      throw new Error(
        `No component named ${name} found in "${this.moduleName}".`
      );
    }
    return path.join(this.getPathToModule(), pathToComponent);
  }

  async getConfig(): Promise<PluginConfig> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginFile = await import(this.getPathToConfig());
    return pluginFile.default;
  }
}
