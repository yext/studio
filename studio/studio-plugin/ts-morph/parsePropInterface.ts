import { TSPropShape } from '../../shared/models'
import getRootPath from '../getRootPath'
import { Project, ts } from 'ts-morph'
import { tsCompilerOptions } from './common'

export default function parsePropInterface(filePath: string, componentPropsName: string): TSPropShape {
  const file = getRootPath(filePath)
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const propsInterface = sourceFile.getDescendantsOfKind(ts.SyntaxKind.InterfaceDeclaration).find(n => {
    return n.getName() === componentPropsName
  })
  if (!propsInterface) {
    throw new Error(`No interface found with name "${componentPropsName}" in file "${filePath}"`)
  }
  const structure = propsInterface.getStructure()
  const properties = structure.properties ?? []
  const props: TSPropShape = {}
  properties.forEach(p => {
    const jsdoc = p.docs?.map(doc => typeof doc === 'string' ? doc : doc.description).join('\n')
    props[p.name] = {
      type: p.type as 'string' | 'number' | 'boolean',
      ...(jsdoc && { doc: jsdoc })
    }
  })
  return props
}

