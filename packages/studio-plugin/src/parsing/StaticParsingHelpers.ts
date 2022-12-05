import { Expression, ImportDeclaration, ObjectLiteralExpression, SyntaxKind } from 'ts-morph'

export type ParsedObjectLiteral = {
  [key: string]: {
    value: string | number | boolean,
    isExpression?: true
  }
}

/**
 * StaticParsingHelpers is a static class for housing lower level details for parsing
 * files within Studio.
 */
export default class StaticParsingHelpers {
  static parseInitializer(
    initializer: Expression
  ): ParsedObjectLiteral[string] {
    if (initializer.isKind(SyntaxKind.StringLiteral)) {
      return { value: initializer.compilerNode.text }
    }
    const expression = initializer.isKind(SyntaxKind.JsxExpression)
      ? initializer.getExpressionOrThrow()
      : initializer
    if (
      expression.isKind(SyntaxKind.PropertyAccessExpression) ||
      expression.isKind(SyntaxKind.TemplateExpression) ||
      expression.isKind(SyntaxKind.ElementAccessExpression) ||
      expression.isKind(SyntaxKind.Identifier)
    ) {
      return { value: expression.getText(), isExpression: true }
    } else if (
      expression.isKind(SyntaxKind.NumericLiteral) ||
      expression.isKind(SyntaxKind.FalseKeyword) ||
      expression.isKind(SyntaxKind.TrueKeyword)
    ) {
      return { value: expression.getLiteralValue() }
    } else {
      throw new Error(
        `Unrecognized initialProps value ${initializer.getFullText()} ` +
        `with kind: ${expression.getKindName()}`)
    }
  }

  static parseObjectLiteral(
    objectLiteral: ObjectLiteralExpression
  ): ParsedObjectLiteral {
    const parsedValues: ParsedObjectLiteral = {}
    objectLiteral.getProperties()
      .forEach(p => {
        if (!p.isKind(SyntaxKind.PropertyAssignment)) {
          console.error(
            'Unrecognized node type',
            p.getKindName(),
            'for object literal',
            p.getFullText()
          )
          return
        }
        const key = p.getName()
        const value = StaticParsingHelpers.parseInitializer(p.getInitializerOrThrow())
        parsedValues[key] = value
      })
    return parsedValues
  }

  static parseImport(importDeclaration: ImportDeclaration): {
    source: string,
    defaultImport?: string,
    namedImports: string[]
   } {
    const source: string = importDeclaration.getModuleSpecifierValue()
    const importClause = importDeclaration.getFirstDescendantByKind(SyntaxKind.ImportClause)
    //  Ignore imports like `import 'index.css'` which lack an import clause
    if (!importClause) {
      return {
        source,
        namedImports: []
      }
    }
    const defaultImport: string | undefined = importClause.getDefaultImport()?.getText()
    const namedImports: string[] = importClause.getNamedImports()
      .map(n => n.compilerNode.name.escapedText.toString())
    return {
      source,
      namedImports,
      defaultImport
    }
  }
}