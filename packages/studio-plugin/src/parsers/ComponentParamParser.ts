import { SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "./StudioSourceFileParser";
import TsMorphHelpers from "./helpers/TsMorphHelpers";

export default class ComponentParamParser {
  constructor(private sourceFileParser: StudioSourceFileParser) {}

  /**
   * Parses the interface name for the component's props.
   * @throws
   */
  parseParamName(): string | undefined {
    const parameters = this.getParameters();
    if (parameters.length > 1) {
      throw new Error(
        "Functional components may contain at most one parameter, found " +
          `${parameters.length} at ${this.sourceFileParser.getFilepath()}`
      );
    }

    const firstParam = parameters[0];
    if (!firstParam) {
      return;
    }

    return firstParam.getTypeNodeOrThrow().getText();
  }

  private getParameters() {
    const defaultExport =
      this.sourceFileParser.getDefaultExportReactComponent();
    if (defaultExport.isKind(SyntaxKind.VariableDeclaration)) {
      const functionNode = TsMorphHelpers.getFirstChildOfKindOrThrow(
        defaultExport,
        SyntaxKind.ArrowFunction,
        SyntaxKind.FunctionExpression
      );
      return functionNode.getParameters();
    }
    return defaultExport.getParameters();
  }
}
