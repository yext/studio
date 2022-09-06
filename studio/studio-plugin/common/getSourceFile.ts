import { SourceFile, Project } from 'ts-morph'
import typescript from 'typescript'

// 'typescript' is a CommonJS module, which may not support all module.exports as named exports
const { JsxEmit } = typescript

export const tsCompilerOptions = {
  compilerOptions: {
    jsx: JsxEmit.ReactJSX
  }
}

export function getSourceFile(file: string): SourceFile {
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  return p.getSourceFileOrThrow(file)
}

