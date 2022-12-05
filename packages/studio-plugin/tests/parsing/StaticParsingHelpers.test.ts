import { Project, SyntaxKind } from 'ts-morph'
import StaticParsingHelpers from '../../src/parsing/StaticParsingHelpers'

describe('parseObjectLiteral', () => {
  it('parsing an object literal with an expression', () => {
    const p = new Project()
    p.createSourceFile('test.ts', `const a = { aKey: another.expression }`)
    const sourceFile = p.getSourceFileOrThrow('test.ts')
    const objectLiteralExpression = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    const parsedValue = StaticParsingHelpers.parseObjectLiteral(objectLiteralExpression)
    expect(parsedValue).toEqual({
      aKey: {
        value: 'another.expression',
        isExpression: true
      }
    })
  })
})