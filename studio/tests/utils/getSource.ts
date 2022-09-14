import { Project, SourceFile } from 'ts-morph'
import { tsCompilerOptions } from '../../studio-plugin/common'

export default function getSource(code: string): SourceFile {
  const p = new Project(tsCompilerOptions)
  p.createSourceFile('testPage.tsx', code)
  return p.getSourceFileOrThrow('testPage.tsx')
}