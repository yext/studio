import { ArrowFunction, FunctionDeclaration, StructureKind, SyntaxKind } from "ts-morph";
import StudioSourceFile from "../files/StudioSourceFile";
import { ComponentState, ComponentStateKind, FileMetadata, PropShape, PropVal, PropValueKind, PropValues, PropValueType } from "../types";

/**
 * ReactComponentFileWriter is a class for housing data
 * updating logic for a React component file (e.g. ModuleFile or PageFile).
 */
export default class ReactComponentFileWriter {
  constructor(
    private componentName: string,
    private studioSourceFile: StudioSourceFile
  ) {}

  private createProps(props: PropValues): string {
    let propsString = "";
    Object.keys(props).forEach((propName) => {
      const propType = props[propName].valueType;
      const val = props[propName].value;
      if (
        props[propName].kind === PropValueKind.Literal &&
        (propType === PropValueType.string ||
          propType === PropValueType.HexColor)
      ) {
        propsString += `${propName}='${val}' `;
      } else {
        propsString += `${propName}={${val}} `;
      }
    });
    return propsString;
  }

  private createReturnStatement(componentTree: ComponentState[]): string {
    const elements = this.studioSourceFile
      .mapComponentStates<string>(componentTree, (c, children): string => {
        if (c.kind === ComponentStateKind.Fragment) {
          return "<>\n" + children.join("\n") + "</>";
        } else if (children.length === 0) {
          return `<${c.componentName} ` + this.createProps(c.props) + "/>";
        } else {
          return (
            `<${c.componentName} ` +
            this.createProps(c.props) +
            ">\n" +
            children.join("\n") +
            `</${c.componentName}>`
          );
        }
      })
      .join("\n");
    return `return (${elements})`;
  }

  private updateReturnStatement(
    functionComponent: FunctionDeclaration | ArrowFunction,
    componentTree: ComponentState[],
  ) {
    const returnStatementIndex = functionComponent
      .getDescendantStatements()
      .findIndex((n) => n.isKind(SyntaxKind.ReturnStatement));
    if (returnStatementIndex < 0) {
      throw new Error(`No return statement found at page: "${this.studioSourceFile.getFilepath()}"`);
    }
    const newReturnStatement = this.createReturnStatement(componentTree);
    functionComponent.removeStatement(returnStatementIndex);
    functionComponent.addStatements(newReturnStatement);
    return this;
  }

  updatePropInterface(propShape: PropShape) {
    const interfaceName = `${this.componentName}Props`;
    const interfaceDeclaration = this.studioSourceFile.getInterface(interfaceName)
    const properties = Object.entries(propShape).map(([key, value]) => ({
      name: key,
      type: value.type,
      hasQuestionToken: true,
      ...(value.doc && { docs: [value.doc] })
     }))
    if (interfaceDeclaration) {
      this.studioSourceFile.updateInterface(
        interfaceDeclaration,
        properties
      )
    } else {
      this.studioSourceFile.addInterface(interfaceName,  properties)
    }
  }

  private getStringifyInitialPropVal(
    propName: string,
    { kind, valueType, value }: PropVal
  ): string {
    if (kind === PropValueKind.Expression) {
      throw new Error(`Prop ${propName} in ${this.componentName} is of kind PropValueKind.Expression. Expression in initialProps is currently not supported.`);
    }
    return valueType === PropValueType.string || valueType === PropValueType.HexColor
     ? `'${value}'`
     : value.toString()
  }

  updateInitialProps(initialProps: PropValues) {
    const initialPropsExpression = this.studioSourceFile.getExportedObjectExpression("initialProps")
    if (initialPropsExpression) {
      this.studioSourceFile.updateObjectLiteral(
        initialPropsExpression,
        Object.entries(initialProps).map(([key, value]) => ({
          kind: StructureKind.PropertyAssignment,
          name: key,
          initializer: this.getStringifyInitialPropVal(key, value)
        }))
      )
    } else {
      const stringifyProperties = Object.entries(initialProps)
        .map(([key, value]) => `${key} : ${this.getStringifyInitialPropVal(key, value)}`)
        .join(',')
      this.studioSourceFile.addVariableStatement("initialProps", `{ ${stringifyProperties} }`, `${this.componentName}Props`)
    }
  }

  updateFile({
    componentTree,
    fileMetadata,
    cssImports,
    onFileUpdate,
  }: {
    componentTree: ComponentState[],
    fileMetadata?: FileMetadata,
    cssImports?: string[],
    onFileUpdate?: (functionComponent: FunctionDeclaration | ArrowFunction) => void,
  }): void {
    const defaultExport = this.studioSourceFile.getDefaultExportReactComponent();
    const functionComponent = defaultExport.isKind(SyntaxKind.VariableDeclaration)
      ? defaultExport.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
      : defaultExport;

    onFileUpdate?.(functionComponent);
    if (fileMetadata) {
      const { initialProps, propShape } = fileMetadata
      if (initialProps) {
        this.updateInitialProps(initialProps)
      }
      if (propShape) {
        this.updatePropInterface(propShape)
        this.studioSourceFile.updateFunctionParameter(functionComponent, Object.keys(propShape), `${this.componentName}Props`)
      }
    }
    this.updateReturnStatement(functionComponent, componentTree)
    this.studioSourceFile.updateFileImports(cssImports);
    this.studioSourceFile.writeToFile()
  }
}
