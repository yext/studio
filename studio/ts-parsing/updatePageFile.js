const fs = require('fs')
const path = require('path')
const { Project, ts } = require('ts-morph')

// TODO turn this into a test fixture?
// updatePageFile(
//   [
//     {
//       "name": "Banner",
//       "props": {
//         "title": "first!",
//         "randomNum": 1,
//       }
//     },
//     {
//       "name": "Banner",
//       "props": {
//         "title": "two",
//         "randomNum": 2,
//         "someBool": false
//       }
//     },
//     {
//       "name": "Banner",
//       "props": {
//         "title": "three",
//         "randomNum": 3,
//         "someBool": false
//       }
//     }
//   ]
// );

module.exports = function updatePageFile(updatedState) {
  const file = path.resolve(__dirname, '../../src/pages/index.tsx')
  const p = new Project({
    compilerOptions: {
      jsx: true
    }
  })
  p.addSourceFilesAtPaths(file)
  const sourceFile = p.getSourceFileOrThrow(file)
  const usedComponents =
  sourceFile.getDescendants().filter(n => [
    ts.SyntaxKind.JsxOpeningElement,
    ts.SyntaxKind.JsxSelfClosingElement
  ].includes(n.compilerNode.kind))
  usedComponents.forEach(n => {
    const name = n.compilerNode.tagName.escapedText;
    const i = updatedState.findIndex(s => s.name === name)
    if (i === -1) {
      return;
    }
    const updatedProps = updatedState[i].props;
    updatedState.shift()
    // console.log(n.getStructure())
    // console.log(convertUpdatedPropsToStructure(n.getStructure(), updatedProps))
    // console.log('---')
    // n.set(convertUpdatedPropsToStructure(n.getStructure(), updatedProps))

    n.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).forEach(a => {
      const structure = a.getStructure();
      const val = updatedProps[structure.name]
      if (val === undefined) {
        return;
      }
      console.log(structure)
      structure.initializer = typeof val === 'string' ? `'${val}'` : `{${val}}`
      // console.log(structure, val)
      a.set(structure);
    })
  })
  const updatedFileText = sourceFile.getFullText();
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