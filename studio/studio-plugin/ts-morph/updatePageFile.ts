import fs from 'fs'
import path from 'path'
import { Project, ts } from 'ts-morph'
import { PageComponentsState } from '../../shared/models'
import getRootPath from '../getRootPath'
import { getComponentName, getComponentNodes, tsCompilerOptions } from './common'

export default function updatePageFile(updatedState: PageComponentsState, pageFilePath) {
  const file = path.resolve(getRootPath(pageFilePath))
  const p = new Project(tsCompilerOptions)
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const usedComponents = getComponentNodes(sourceFile)
  usedComponents.forEach(n => {
    const name = getComponentName(n)
    const i = updatedState.findIndex(s => s.name === name)
    if (i === -1) {
      return
    }
    const updatedProps = updatedState[i].props
    updatedState.shift()

    // TODO I suspect in order to handle adding new props (not just changing preexisting ones)
    // we will need to update the structure of the JsxAttributes, not just the individual JsxAttribute
    // Ran into some difficulties and vague error messages.

    // console.log(n.getStructure())
    // console.log(convertUpdatedPropsToStructure(n.getStructure(), updatedProps))
    // console.log('---')
    // n.set(convertUpdatedPropsToStructure(n.getStructure(), updatedProps))

    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const structure = a.getStructure()
      const val = updatedProps[structure.name]
      if (val === undefined) {
        return
      }
      console.log(structure)
      structure.initializer = typeof val === 'string' ? `'${val}'` : `{${val}}`
      // console.log(structure, val)
      a.set(structure)
    })
  })
  const updatedFileText = sourceFile.getFullText()
  // console.log(updatedFileText);
  fs.writeFileSync(file, updatedFileText)
}

// function convertUpdatedPropsToStructure(componentName, updatedProps) {
//   return {
//     name: componentName,
//     attributes: Object.keys(updatedProps).map(propName => {
//       const val = updatedProps[propName]
//       if (val === undefined) {
//         return;
//       }
//       return {
//         name: propName,
//         kind: ts.SyntaxKind.OpenParenToken,
//         initializer: typeof val === 'string' ? `'${val}'` : `{${val}}`
//       }
//     })
//   }
// }