import {
  ArrowFunction,
  FunctionDeclaration,
  InterfaceDeclaration,
  ObjectLiteralExpression,
  ObjectLiteralExpressionPropertyStructures,
  OptionalKind,
  Project,
  PropertySignatureStructure,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph";
import prettier from "prettier";
import { tsMorphProject } from "./StudioSourceFile";
import fs from "fs";

/**
 * StudioSourceFileWriter contains shared business logic for
 * mutating source files used by Studio.
 */
export default class StudioSourceFileWriter {
  protected sourceFile: SourceFile;

  constructor(protected filepath: string, project: Project = tsMorphProject) {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
    this.sourceFile = project.getSourceFileOrThrow(filepath);
  }

  /**
   * Run prettier on the source file's content.
   *
   * @returns the formatted content
   */
  prettify(): string {
    return prettier.format(this.sourceFile.getFullText(), {
      parser: "typescript",
    });
  }

  writeToFile() {
    const updatedFileText = this.prettify();
    fs.writeFileSync(this.filepath, updatedFileText);
  }

  updateObjectLiteral(
    objectLiteralExp: ObjectLiteralExpression,
    properties: ObjectLiteralExpressionPropertyStructures[]
  ) {
    objectLiteralExp.getProperties().forEach(prop => prop.remove())
    objectLiteralExp.addProperties(properties)
  }

  updateInterface(
    interfaceDeclaration: InterfaceDeclaration,
    properties: OptionalKind<PropertySignatureStructure>[]
  ) {
    interfaceDeclaration.removeText()
    interfaceDeclaration.addProperties(properties)
  }

  /**
   * Mutates the source file by adding missing import declarations for identifiers
   * that are referenced in the file, removing import declarations that are no longer
   * needed, and adding any provided css imports.
   *
   * @param cssImports - css file paths to add as import declarations to the file
   */
  updateFileImports(cssImports?: string[]) {
    this.sourceFile.fixMissingImports();
    cssImports?.forEach((importSource) => {
      this.sourceFile.addImportDeclaration({
        moduleSpecifier: importSource,
      });
    });
    this.sourceFile.organizeImports();
  }

  /**
   * Add an import to source file if it's not already imported, either
   * by setting default and named imports to an existing import declaration
   * matching the provided source or creating a new import declaration node.
   *
   * @param importData - the import and source identifier(s) to add to file.
   */
  addFileImport(importData: {
    source: string;
    defaultImport?: string;
    namedImports?: string[];
  }): void {
    const { source, namedImports, defaultImport } = importData;
    const importDeclaration = this.sourceFile.getImportDeclaration(
      (i) => i.getModuleSpecifierValue() !== source
    );
    if (importDeclaration) {
      namedImports && importDeclaration.addNamedImports(namedImports);
      defaultImport && importDeclaration.setDefaultImport(defaultImport);
    } else {
      this.sourceFile.addImportDeclaration({
        moduleSpecifier: source,
        namedImports,
        defaultImport,
      });
    }
  }

  /**
   * Adds a variable statement at the top of the file,
   * under the last import statement, if any.
   *
   * @param name - the variable's name for the left side of the statement
   * @param content - the variable's content for the right side of the statement
   */
  addVariableStatement(name: string, content: string, type?: string): void {
    const lastImportStatementIndex =
      this.sourceFile
        .getLastChildByKind(SyntaxKind.ImportDeclaration)
        ?.getChildIndex() ?? -1;
    this.sourceFile.insertVariableStatement(lastImportStatementIndex + 1, {
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name, type, initializer: content }],
    });
  }

  addInterface(name: string, properties: OptionalKind<PropertySignatureStructure>[]) {
    const lastImportStatementIndex =
      this.sourceFile
        .getLastChildByKind(SyntaxKind.ImportDeclaration)
        ?.getChildIndex() ?? -1;
    this.sourceFile.insertInterface(lastImportStatementIndex + 1, {
      name,
      properties
    })
  }

  updateFunctionParameter(
    functionNode: FunctionDeclaration | ArrowFunction,
    props: string[],
    type: string,
    index = 0
  ) {
      functionNode.getParameters()[index]?.remove()
      functionNode.insertParameter(index, {
      name: `{ ${props.join(', ')} }`,
      type
    })
  }
}
