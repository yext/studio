import typescript, { ModuleResolutionHost } from 'typescript'
import fs from 'fs'
import { resolve } from 'path'

// 'typescript' is a CommonJS module, which may not support all module.exports as named exports
const { resolveModuleName } = typescript

export function resolveNpmModule(moduleName: string): string {
  const customModuleResolutionHost: ModuleResolutionHost = {
    fileExists(fileName) {
      return fs.existsSync(resolveTsFileName(fileName))
    },
    readFile(fileName) {
      return fs.readFileSync(resolveTsFileName(fileName), 'utf-8')
    }
  }

  const { resolvedModule } = resolveModuleName(moduleName, '', {}, customModuleResolutionHost)
  if (!resolvedModule) {
    throw new Error(`Could not resolve module: "${moduleName}"`)
  }
  const absPath = resolveTsFileName(resolvedModule.resolvedFileName)
  return absPath

  function resolveTsFileName(fileName: string) {
    return resolve(__dirname, '../../..', fileName)
  }
}