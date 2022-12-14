import {
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph";
import prettier from "prettier";
import { tsMorphProject } from "./StudioSourceFile";

/**
 * StudioSourceFileWriter contains shared business logic for
 * mutating source files used by Studio.
 */
export default class StudioSourceFileWriter {
  protected sourceFile: SourceFile;

  constructor(filepath: string, project: Project = tsMorphProject) {
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
}
