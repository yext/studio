import typescript, { ModuleResolutionHost } from 'typescript';
import fs from 'fs';

// 'typescript' is a CommonJS module, which may not support all module.exports as named exports
const { resolveModuleName } = typescript;

export function resolveNpmImport(moduleName: string): string {
  const rootPath = process.cwd();
  const customModuleResolutionHost: ModuleResolutionHost = {
    fileExists(fileName) {
      return fs.existsSync(rootPath + fileName);
    },
    readFile(fileName) {
      return fs.readFileSync(rootPath + fileName, 'utf-8');
    }
  }

  const ast = resolveModuleName("@yext/sample-component", '', {}, customModuleResolutionHost);
  console.log({ast});
  if (!ast.resolvedModule) {
    throw new Error(`Could not resolve module: "${moduleName}"`);
  }

  return rootPath + ast.resolvedModule.resolvedFileName;
}
