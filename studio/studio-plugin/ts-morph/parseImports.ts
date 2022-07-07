import path from 'path'
import { Project} from 'ts-morph'
import getRootPath from '../getRootPath'
import { tsCompilerOptions } from './common'

export default function parseImports(filePathFromSrc) {
  const filePath = path.resolve(getRootPath(filePathFromSrc))
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(filePath)
  const sourceFile = p.getSourceFileOrThrow(filePath)
  console.log(sourceFile.getDescendantStatements())
}